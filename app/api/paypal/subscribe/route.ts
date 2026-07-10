import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPaypalSubscription } from "@/lib/paypal"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { body, statusCode } = await createPaypalSubscription(user.id)

    if (statusCode >= 400) {
      return NextResponse.json({ error: "Failed to create subscription", details: body }, { status: statusCode })
    }

    // Store subscription ID temporarily (will be confirmed via webhook)
    await supabase
      .from("profiles")
      .update({
        paypal_subscription_id: body.id,
        payment_pending: true,
      })
      .eq("id", user.id)

    return NextResponse.json({
      subscriptionId: body.id,
      approvalUrl: body.links?.find((l: any) => l.rel === "approve")?.href,
    })
  } catch (error: any) {
    console.error("Create subscription error:", error)
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
