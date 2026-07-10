"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CreditCard, CheckCircle, Clock, DollarSign, Check, Loader2, ExternalLink } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const [subscribing, setSubscribing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const utils = trpc.useUtils()

  const { data: profile, isLoading: profileLoading } = trpc.profiles.get.useQuery()
  const utilsRef = useRef(utils)
  utilsRef.current = utils
  const pollingRef = useRef(false)
  const toastShownRef = useRef(false)

  // Handle PayPal callback
  useEffect(() => {
    const subscriptionStatus = searchParams.get("subscription")
    if (subscriptionStatus !== "success") {
      if (subscriptionStatus === "cancelled") {
        toast.info("Subscription cancelled", { description: "You can resubscribe anytime." })
        window.history.replaceState({}, "", "/subscription")
      }
      return
    }

    // Prevent duplicate polling
    if (pollingRef.current || verifying) return
    pollingRef.current = true

    console.log("Starting polling, setting verifying=true")
    setVerifying(true)
    let retryCount = 0
    const MAX_RETRIES = 10
    const POLL_INTERVAL = 2000
    let timeoutId: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/paypal/status")
        const data = await res.json()
        console.log("Polling status:", data)

        if (data.hasSubscription && data.status === "active" && data.plan === "pro") {
          console.log("Subscription success, setting verifying=false")
          utilsRef.current.profiles.get.invalidate()
          if (!toastShownRef.current) {
            toastShownRef.current = true
            toast.success("Subscription activated!", { description: "Welcome to Creator Club!" })
          }
          setVerifying(false)
          window.history.replaceState({}, "", "/subscription")
          return
        }

        retryCount++
        if (retryCount >= MAX_RETRIES) {
          console.log("Max retries reached (try), setting verifying=false")
          toast.error("Verification pending", {
            description: "Your payment is being processed. Please check back in a few minutes."
          })
          setVerifying(false)
          window.history.replaceState({}, "", "/subscription")
          return
        }

        timeoutId = setTimeout(checkStatus, POLL_INTERVAL)
      } catch {
        retryCount++
        if (retryCount >= MAX_RETRIES) {
          console.log("Max retries reached (catch), setting verifying=false")
          toast.error("Verification pending", {
            description: "Your payment is being processed. Please check back in a few minutes."
          })
          setVerifying(false)
          window.history.replaceState({}, "", "/subscription")
          return
        }
        timeoutId = setTimeout(checkStatus, POLL_INTERVAL)
      }
    }

    checkStatus()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [searchParams, verifying])

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
        utilsRef.current.profiles.get.invalidate()
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
                setVerifying(false)
                window.history.replaceState({}, "", "/subscription")
              }}
            >
              Cancel and check later
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      {!verifying && (
        <Card className="shadow-card overflow-hidden border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-violet-500" />
              Current Plan
            </CardTitle>
            <CardDescription>
              You&apos;re currently on the{" "}
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">{planLabel}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{planLabel} Plan — $9.90/mo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile?.plan === "pro" || profile?.plan === "team"
                      ? "Unlimited deals, invoicing, AI contract scanner, rate benchmarks, priority support"
                      : "3 active deals, basic features"}
                  </p>
                  {profile?.payment_pending && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Payment pending verification
                    </p>
                  )}
                  {profile?.plan === "pro" && !profile?.payment_pending && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Active
                    </p>
                  )}
                  {profile?.plan === "pro" && profile?.subscription_expires_at && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Expires {formatDate(profile.subscription_expires_at)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {profile?.plan !== "pro" && (
                    <Button onClick={handleSubscribe} disabled={subscribing}>
                      {subscribing ? "Redirecting to PayPal..." : "Subscribe — $9.90/mo"}
                    </Button>
                  )}
                  {profile?.plan === "pro" && profile?.subscription_status !== "cancelled" && (
                    <Button onClick={handleCancelSubscription} variant="outline" disabled={cancelling}>
                      {cancelling ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Features for non-pro users */}
            {profile?.plan !== "pro" && (
              <div className="rounded-lg p-4 bg-teal-50">
                <p className="font-medium text-sm text-slate-700 mb-3">Creator Club includes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Unlimited deals",
                    "Smart invoicing",
                    "AI contract scanner",
                    "Rate benchmarking",
                    "Priority support"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-teal-600" />
                      </div>
                      <span className="text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
