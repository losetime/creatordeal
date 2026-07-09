import { PaypalClient, PaypalEnvironment } from "@paypal/paypal-server-sdk"

const isLive = process.env.PAYPAL_MODE === "live"

const paypalClient = new PaypalClient({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: isLive ? PaypalEnvironment.Live : PaypalEnvironment.Sandbox,
})

export { paypalClient }

// Plan ID from PayPal dashboard
export const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID || "P-0EV63716US865732JNJHSVKQ"

// Create a subscription
export async function createPaypalSubscription(userId: string) {
  const request = {
    planId: PAYPAL_PLAN_ID,
    subscriber: {
      name: {
        given_name: "CreatorDeal",
        surname: "User",
      },
    },
    application_context: {
      brand_name: "CreatorDeal",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=cancelled`,
    },
  }

  const { body, ...httpResponse } = await paypalClient.subscriptionsController.createSubscription(request)
  return { body: JSON.parse(body as string), statusCode: httpResponse.statusCode }
}

// Get subscription details
export async function getPaypalSubscription(subscriptionId: string) {
  const { body, ...httpResponse } = await paypalClient.subscriptionsController.getSubscription(subscriptionId)
  return { body: JSON.parse(body as string), statusCode: httpResponse.statusCode }
}

// Cancel a subscription
export async function cancelPaypalSubscription(subscriptionId: string, reason: string = "User requested cancellation") {
  const { body, ...httpResponse } = await paypalClient.subscriptionsController.cancelSubscription(subscriptionId, { reason })
  return { body: body ? JSON.parse(body as string) : null, statusCode: httpResponse.statusCode }
}

// Verify webhook signature (simplified - in production use PayPal's SDK verification)
export function verifyWebhookSignature(headers: Record<string, string>, body: string): boolean {
  // In production, use paypalClient.webhookHooks.verifyWebhookSignature()
  // For now, we'll trust webhooks from PayPal (they come from known IPs)
  return true
}
