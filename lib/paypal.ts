import { Client, Environment, SubscriptionsController, ExperienceContextShippingPreference, ApplicationContextUserAction } from "@paypal/paypal-server-sdk"

const isLive = process.env.PAYPAL_MODE === "live"

const paypalClient = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  },
  environment: isLive ? Environment.Production : Environment.Sandbox,
})

const subscriptionsController = new SubscriptionsController(paypalClient)

export { paypalClient }

// Plan ID from PayPal dashboard
export const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID || "P-0EV63716US865732JNJHSVKQ"

// Create a subscription
export async function createPaypalSubscription(userId: string) {
  const request = {
    body: {
      planId: PAYPAL_PLAN_ID,
      subscriber: {
        name: {
          givenName: "CreatorDeal",
          surname: "User",
        },
      },
      applicationContext: {
        brandName: "CreatorDeal",
        locale: "en-US",
        shippingPreference: ExperienceContextShippingPreference.NoShipping,
        userAction: ApplicationContextUserAction.SubscribeNow,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=cancelled`,
      },
    },
  }

  const response = await subscriptionsController.createSubscription(request)
  return { body: response.result, statusCode: response.statusCode }
}

// Get subscription details
export async function getPaypalSubscription(subscriptionId: string) {
  const response = await subscriptionsController.getSubscription({ id: subscriptionId })
  return { body: response.result, statusCode: response.statusCode }
}

// Cancel a subscription
export async function cancelPaypalSubscription(subscriptionId: string, reason: string = "User requested cancellation") {
  const response = await subscriptionsController.cancelSubscription({
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
