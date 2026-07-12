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
export const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID
if (!PAYPAL_PLAN_ID) {
  console.warn("PAYPAL_PLAN_ID not set - subscription features may not work")
}

// Create a subscription
export async function createPaypalSubscription(userId: string) {
  const request = {
    body: {
      planId: PAYPAL_PLAN_ID!,
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
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?subscription=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?subscription=cancelled`,
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

// Verify PayPal webhook signature
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured")
    return false
  }

  try {
    const signatureVerification = await paypalClient.webhookHooks.verifyWebhookSignature({
      body: body as any,
      webhookId,
      authAlgo: headers["paypal-auth-algo"] || "",
      certUrl: headers["paypal-cert-url"] || "",
      signature: headers["paypal-transmission-sig"] || "",
      timestamp: headers["paypal-transmission-time"] || "",
    })

    return signatureVerification.result?.verification_status === "SUCCESS"
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return false
  }
}
