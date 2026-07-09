import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cancelPaypalSubscription } from "@/lib/paypal"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("paypal_subscription_id")
      .eq("id", user.id)
      .single()

    if (!profile?.paypal_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    const { statusCode } = await cancelPaypalSubscription(profile.paypal_subscription_id)

    if (statusCode >= 400 && statusCode !== 204) {
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: statusCode })
    }

    // Update user profile - keep benefits until period ends
    await supabase
      .from("profiles")
      .update({
        subscription_status: "cancelled",
      })
      .eq("id", user.id)

    return NextResponse.json({ success: true, message: "Subscription cancelled. Benefits remain until end of billing period." })
  } catch (error: any) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
