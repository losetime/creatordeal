import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("paypal_subscription_id, plan, subscription_status")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Profile query error:", JSON.stringify(error))
    }

    return NextResponse.json({
      hasSubscription: !!profile?.paypal_subscription_id,
      plan: profile?.plan || "free",
      status: profile?.subscription_status,
      expiresAt: profile?.subscription_expires_at,
      paypalSubscriptionId: profile?.paypal_subscription_id,
    })
  } catch (error: any) {
    console.error("Get subscription status error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
