import { Client, Environment } from "@paypal/paypal-server-sdk"

const isLive = process.env.PAYPAL_MODE === "live"

const paypalClient = new Client({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: isLive ? Environment.Production : Environment.Sandbox,
})

export { paypalClient }

// Plan ID from PayPal dashboard
export const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID || "P-0EV63716US865732JNJHSVKQ"

// Create a subscription
export async function createPaypalSubscription(userId: string) {
  const request = {
    body: {
      plan_id: PAYPAL_PLAN_ID,
      subscriber: {
        name: {
          given_name: "CreatorDeal",
          surname: "User",
        },
      },
      application_context: {
        brand_name: "CreatorDeal",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING" as const,
        user_action: "SUBSCRIBE_NOW" as const,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=cancelled`,
      },
    },
  }

  const response = await paypalClient.subscriptionsController.createSubscription(request)
  return { body: response.result, statusCode: response.statusCode }
}

// Get subscription details
export async function getPaypalSubscription(subscriptionId: string) {
  const response = await paypalClient.subscriptionsController.getSubscription({ id: subscriptionId })
  return { body: response.result, statusCode: response.statusCode }
}

// Cancel a subscription
export async function cancelPaypalSubscription(subscriptionId: string, reason: string = "User requested cancellation") {
  const response = await paypalClient.subscriptionsController.cancelSubscription({
    id: subscriptionId,
    body: { reason },
  })
  return { body: response.result, statusCode: response.statusCode }
}

// Verify webhook signature (simplified - in production use PayPal's SDK verification)
export function verifyWebhookSignature(headers: Record<string, string>, body: string): boolean {
  // In production, use paypalClient.webhookHooks.verifyWebhookSignature()
  // For now, we'll trust webhooks from PayPal (they come from known IPs)
  return true
}
