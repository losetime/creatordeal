"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CreditCard, CheckCircle, Clock, DollarSign, Check, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { paypalVerificationStore } from "@/lib/paypal-verification-store"
import { usePaypalVerification } from "@/hooks/use-paypal-verification"

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const [subscribing, setSubscribing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const utils = trpc.useUtils()
  const utilsRef = useRef(utils)
  utilsRef.current = utils

  const { data: profile, isLoading: profileLoading } = trpc.profiles.get.useQuery()

  // 唯一的状态来源：verifying / success / idle / failed 都来自这个 store
  const verification = usePaypalVerification()
  const verifying = verification.status === "verifying"

  // 处理 PayPal 回调，发起（或跳过重复发起）轮询
  useEffect(() => {
    const subscriptionStatus = searchParams.get("subscription")

    if (subscriptionStatus === "cancelled") {
      toast.info("Subscription cancelled", { description: "You can resubscribe anytime." })
      window.location.href = "/subscription"
      return
    }

    if (subscriptionStatus !== "success") return

    paypalVerificationStore.start(
      // onSuccess
      () => {
        utilsRef.current.profiles.get.invalidate()
        toast.success("Subscription activated!", { description: "Welcome to Creator Club!" })
        window.location.href = "/subscription"
      },
      // onGiveUp
      () => {
        toast.error("Verification pending", {
          description: "Your payment is being processed. Please check back in a few minutes."
        })
        window.location.href = "/subscription"
      }
    )
  }, [searchParams])

  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const res = await fetch("/api/paypal/subscribe", { method: "POST" })
      const data = await res.json()
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      } else {
        toast.error("Failed to create subscription", { description: data.error })
        setSubscribing(false)
      }
    } catch {
      toast.error("Failed to create subscription")
      setSubscribing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.")) {
      return
    }
    setCancelling(true)
    try {
      const res = await fetch("/api/paypal/cancel", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success("Subscription cancelled", { description: data.message })
        utils.profiles.get.invalidate()
      } else {
        toast.error("Failed to cancel", { description: data.error })
      }
    } catch {
      toast.error("Failed to cancel subscription")
    } finally {
      setCancelling(false)
    }
  }

  const planLabel = profile?.plan === "pro" ? "Creator Club" : profile?.plan === "team" ? "Team" : "Free"

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
          <div className="absolute inset-0 dot-pattern opacity-15" />
          <div className="relative flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-white/15" />
            <div>
              <Skeleton className="h-6 w-32 bg-white/15" />
              <Skeleton className="h-4 w-48 bg-white/15 mt-1" />
            </div>
          </div>
        </div>
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center gap-2">
          <div className="bg-white/15 p-1.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Subscription</h2>
            <p className="text-xs text-teal-100">Manage your Creator Club subscription</p>
          </div>
        </div>
      </div>

      {/* Verifying State */}
      {verifying && (
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-teal-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Confirming your subscription...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we verify your payment with PayPal.</p>
            <p className="text-xs text-muted-foreground mt-2">This usually takes less than 30 seconds.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => {
                paypalVerificationStore.stop()
                window.location.href = "/subscription"
              }}
            >
              Check later
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      {!verifying && (
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Plan Card */}
          <div className={`relative rounded-xl border bg-card p-8 ${
            profile?.plan !== "pro" ? "border-primary shadow-lg shadow-primary/10" : "border-border"
          }`}>
            {profile?.plan !== "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
              </div>
            )}
            <h3 className="text-xl font-semibold text-foreground">Free</h3>
            <p className="text-sm text-muted-foreground">Perfect for getting started</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground"> forever</span>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Up to 3 active deals",
                "Basic invoicing",
                "Payment tracking",
                "Email support"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            {profile?.plan !== "pro" && (
              <div className="mt-8">
                <p className="text-xs text-center text-muted-foreground">Your current plan</p>
              </div>
            )}
          </div>

          {/* Creator Club Plan Card */}
          <div className={`relative rounded-xl border bg-card p-8 ${
            profile?.plan === "pro" ? "border-primary shadow-lg shadow-primary/10" : "border-border"
          }`}>
            {profile?.plan === "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
              </div>
            )}
            {profile?.plan !== "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            <h3 className="text-xl font-semibold text-foreground">Creator Club</h3>
            <p className="text-sm text-muted-foreground">For serious creators</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">$9.90</span>
              <span className="text-muted-foreground"> /month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Unlimited deals",
                "Smart invoicing",
                "AI contract scanner",
                "Rate benchmarking",
                "Priority support",
                "Custom branding"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {profile?.plan === "pro" ? (
                <div className="space-y-2">
                  {profile?.payment_pending && (
                    <p className="text-xs text-center text-amber-600 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" /> Payment pending verification
                    </p>
                  )}
                  {profile?.subscription_expires_at && (
                    <p className="text-xs text-center text-muted-foreground">
                      Expires {formatDate(profile.subscription_expires_at)}
                    </p>
                  )}
                  {profile?.subscription_status !== "cancelled" && (
                    <Button onClick={handleCancelSubscription} variant="outline" className="w-full" disabled={cancelling}>
                      {cancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={handleSubscribe} className="w-full" disabled={subscribing}>
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to PayPal...
                    </>
                  ) : (
                    "Subscribe — $9.90/mo"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription History */}
      {!verifying && (
        <Card className="shadow-card overflow-hidden border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-violet-500" />
              Subscription History
            </CardTitle>
            <CardDescription>
              Your CreatorDeal subscription records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!profile?.payment_order_id ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No subscription history yet.
              </div>
            ) : (
              <div className="divide-y">
                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Creator Club — Monthly</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.payment_submitted_at ? formatDate(profile.payment_submitted_at) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        profile.payment_pending
                          ? "bg-amber-100 text-amber-700"
                          : profile.plan === "pro"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {profile.payment_pending ? "Pending" : profile.plan === "pro" ? "Active" : "Expired"}
                    </Badge>
                    <span className="text-sm font-medium">$9.90/mo</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
