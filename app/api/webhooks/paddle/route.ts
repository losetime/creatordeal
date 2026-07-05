import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || ""

function verifyPaddleWebhook(body: string, headers: Headers): boolean {
  if (!PADDLE_WEBHOOK_SECRET) return true
  const signature = headers.get("paddle-signature")
  if (!signature) return false
  // Paddle webhook verification - in production, implement proper HMAC verification
  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.text()

    if (!verifyPaddleWebhook(body, request.headers)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventType = event.event_type

    const supabase = await createClient()

    switch (eventType) {
      case "subscription.created":
      case "subscription.updated": {
        const subscription = event.data
        const customerId = subscription.customer_id
        const planId = subscription.items?.[0]?.price?.id

        // Determine plan based on price ID
        let plan = "free"
        if (planId === process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID) {
          plan = "pro"
        } else if (planId === process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID) {
          plan = "team"
        }

        // Update profile
        await supabase
          .from("profiles")
          .update({
            plan,
            subscription_status: subscription.status || "active",
            stripe_subscription_id: subscription.id,
          })
          .eq("email", subscription.custom_data?.user_email || "")

        break
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const subscription = event.data

        await supabase
          .from("profiles")
          .update({
            plan: "free",
            subscription_status: "inactive",
          })
          .eq("stripe_subscription_id", subscription.id)

        break
      }

      case "transaction.completed": {
        const transaction = event.data
        const customerId = transaction.customer_id

        // Log transaction for reference
        console.log("Transaction completed:", transaction.id, transaction.amount)
        break
      }

      default:
        console.log("Unhandled Paddle event:", eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Paddle webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
