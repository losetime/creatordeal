import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const eventType = body.event_type
    const resource = body.resource

    console.log("PayPal webhook received:", eventType, resource?.id)

    const admin = createAdminClient()
    const resend = new Resend(process.env.RESEND_API_KEY)

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        // Subscription activated - user has completed payment
        const subscriptionId = resource.id
        const subscriberEmail = resource.subscriber?.email_address
        const nextBillingTime = resource.next_billing_time

        // Find user by paypal_subscription_id or subscriber email
        const { data: profile } = await admin
          .from("profiles")
          .select("id, email, full_name")
          .eq("paypal_subscription_id", subscriptionId)
          .single()

        if (!profile && subscriberEmail) {
          // Try to find by email
          const { data: profileByEmail } = await admin
            .from("profiles")
            .select("id, email, full_name")
            .eq("email", subscriberEmail)
            .single()

          if (profileByEmail) {
            // Link subscription to user
            await admin
              .from("profiles")
              .update({
                paypal_subscription_id: subscriptionId,
                paypal_payer_id: resource.subscriber?.payer_id,
                plan: "pro",
                subscription_status: "active",
                subscription_expires_at: nextBillingTime,
                payment_pending: false,
              })
              .eq("id", profileByEmail.id)

            // Send welcome email
            if (profileByEmail.email) {
              await resend.emails.send({
                from: `CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
                to: [profileByEmail.email],
                subject: `🎉 Welcome to Creator Club!`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0d9488, #10b981); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Creator Club!</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your subscription is now active</p>
                    </div>
                    <p>Hi ${profileByEmail.full_name || "there"},</p>
                    <p>Thank you for subscribing to <strong>Creator Club</strong>! Your payment has been processed successfully.</p>
                    <div style="background: #f0fdf4; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0;"><strong>Your Subscription Details:</strong></p>
                      <p style="margin: 0;">Plan: Creator Club — $9.90/month</p>
                      <p style="margin: 4px 0 0 0;">Next billing: <strong>${nextBillingTime ? formatDate(nextBillingTime) : "N/A"}</strong></p>
                    </div>
                    <p>You now have access to unlimited deals, smart invoicing, AI contract scanner, rate benchmarking, and priority support.</p>
                    <p>We truly appreciate your support!</p>
                    <p>Best regards,<br>The CreatorDeal Team</p>
                  </div>
                `,
              })
            }
          }
        } else if (profile) {
          // User found, update subscription
          await admin
            .from("profiles")
            .update({
              plan: "pro",
              subscription_status: "active",
              subscription_expires_at: nextBillingTime,
              payment_pending: false,
            })
            .eq("id", profile.id)
        }
        break
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Payment completed (renewal)
        const subscriptionId = resource.billing_info?.next_billing_time
          ? resource.id
          : null

        if (subscriptionId) {
          const { data: profile } = await admin
            .from("profiles")
            .select("id")
            .eq("paypal_subscription_id", subscriptionId)
            .single()

          if (profile) {
            await admin
              .from("profiles")
              .update({
                subscription_expires_at: resource.billing_info?.next_billing_time,
                last_payment_at: new Date().toISOString(),
              })
              .eq("id", profile.id)
          }
        }
        break
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        // User cancelled subscription
        const subscriptionId = resource.id
        const { data: profile } = await admin
          .from("profiles")
          .select("id, email, full_name, subscription_expires_at")
          .eq("paypal_subscription_id", subscriptionId)
          .single()

        if (profile) {
          // Keep pro benefits until current period ends
          await admin
            .from("profiles")
            .update({
              subscription_status: "cancelled",
            })
            .eq("id", profile.id)

          // Send cancellation email
          if (profile.email) {
            await resend.emails.send({
              from: `CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
              to: [profile.email],
              subject: `Subscription Cancelled`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #0d9488;">Subscription Cancelled</h2>
                  <p>Hi ${profile.full_name || "there"},</p>
                  <p>Your Creator Club subscription has been cancelled.</p>
                  <p>You will continue to have access to your benefits until <strong>${profile.subscription_expires_at ? formatDate(profile.subscription_expires_at) : "the end of your current billing period"}</strong>.</p>
                  <p>We're sorry to see you go. If you change your mind, you can resubscribe anytime from your settings.</p>
                  <p>Best regards,<br>The CreatorDeal Team</p>
                </div>
              `,
            })
          }
        }
        break
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        // Payment failed
        const subscriptionId = resource.id
        const { data: profile } = await admin
          .from("profiles")
          .select("id, email, full_name")
          .eq("paypal_subscription_id", subscriptionId)
          .single()

        if (profile) {
          await admin
            .from("profiles")
            .update({
              subscription_status: "payment_failed",
            })
            .eq("id", profile.id)

          // Send payment failed email
          if (profile.email) {
            await resend.emails.send({
              from: `CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
              to: [profile.email],
              subject: `Payment Failed - Action Required`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #dc2626;">Payment Failed</h2>
                  <p>Hi ${profile.full_name || "there"},</p>
                  <p>We were unable to process your payment for Creator Club subscription.</p>
                  <p>Please update your payment method in PayPal to avoid service interruption.</p>
                  <p>If you need assistance, please contact our support team.</p>
                  <p>Best regards,<br>The CreatorDeal Team</p>
                </div>
              `,
            })
          }
        }
        break
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        // Subscription suspended
        const subscriptionId = resource.id
        await admin
          .from("profiles")
          .update({
            subscription_status: "suspended",
          })
          .eq("paypal_subscription_id", subscriptionId)
        break
      }

      default:
        console.log("Unhandled webhook event:", eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
