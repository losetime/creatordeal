import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPaypalSubscription } from "@/lib/paypal"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("paypal_subscription_id, plan, subscription_status, subscription_expires_at")
      .eq("id", user.id)
      .single()

    if (!profile?.paypal_subscription_id) {
      return NextResponse.json({
        hasSubscription: false,
        plan: profile?.plan || "free",
      })
    }

    // Get subscription details from PayPal
    const { body, statusCode } = await getPaypalSubscription(profile.paypal_subscription_id)

    if (statusCode >= 400) {
      return NextResponse.json({
        hasSubscription: true,
        paypalStatus: "unknown",
        localStatus: profile.subscription_status,
        plan: profile.plan,
        expiresAt: profile.subscription_expires_at,
      })
    }

    return NextResponse.json({
      hasSubscription: true,
      paypalData: body,
      localStatus: profile.subscription_status,
      plan: profile.plan,
      expiresAt: profile.subscription_expires_at,
    })
  } catch (error: any) {
    console.error("Get subscription status error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
