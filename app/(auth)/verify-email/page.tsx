"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!email || cooldown > 0) return
    setLoading(true)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Verification email sent!")
    setCooldown(60)
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="CreatorDeal" className="h-10 w-10" />
            <span className="text-2xl font-bold text-white">CreatorDeal</span>
          </Link>
        </div>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              {email ? (
                <p className="text-muted-foreground">
                  We&apos;ve sent a verification link to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  We&apos;ve sent a verification link to your email address.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Click the link in the email to activate your account. If you don&apos;t see it, check your spam folder.
              </p>

              <div className="pt-2 space-y-3 w-full">
                <Button
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend verification email"}
                </Button>
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
