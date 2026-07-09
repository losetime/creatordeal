import { router, protectedProcedure } from "../server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper to check if user is admin
async function requireAdmin(ctx: any) {
  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("role")
    .eq("id", ctx.user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
}

export const adminRouter = router({
  getPendingPayments: protectedProcedure.query(async ({ ctx }) => {
    await requireAdmin(ctx)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, email, payment_pending, payment_order_id, payment_submitted_at")
      .eq("payment_pending", true)
      .order("payment_submitted_at", { ascending: false })

    if (error) throw error
    return data
  }),

  getAllMembers: protectedProcedure.query(async ({ ctx }) => {
    await requireAdmin(ctx)
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, email, plan, subscription_status, payment_pending, payment_order_id, payment_submitted_at, payment_confirmed_at")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  confirmPayment: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(ctx)
      const admin = createAdminClient()
      
      // Set expiry to 30 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      
      // Get user info before update
      const { data: userProfile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", input.userId)
        .single()

      const { error } = await admin
        .from("profiles")
        .update({
          payment_pending: false,
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmed_by: ctx.user.id,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", input.userId)

      if (error) throw error

      // Send confirmation email
      if (userProfile?.email) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: `CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
          to: [userProfile.email],
          subject: `🎉 Welcome to Creator Club!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9488, #10b981); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Creator Club!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your subscription has been confirmed</p>
              </div>
              
              <p>Hi ${userProfile.full_name || "there"},</p>
              
              <p>Thank you for upgrading to <strong>Creator Club</strong>! We're thrilled to have you on board. Your payment has been verified and your subscription is now active.</p>
              
              <div style="background: #f0fdf4; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Your Subscription Details:</strong></p>
                <p style="margin: 0;">Plan: Creator Club — $9.90/month</p>
                <p style="margin: 4px 0 0 0;">Valid until: <strong>${formatDate(expiresAt.toISOString())}</strong></p>
              </div>
              
              <p>With Creator Club, you now have access to:</p>
              <ul style="color: #4b5563;">
                <li>Unlimited deals</li>
                <li>Smart invoicing with PDF generation</li>
                <li>AI contract scanner</li>
                <li>Rate benchmarking</li>
                <li>Priority support</li>
              </ul>
              
              <p>We truly appreciate your support. It helps us continue building better tools for creators like you. If you have any questions, don't hesitate to reach out!</p>
              
              <p>Best regards,<br>The CreatorDeal Team</p>
              
              <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p>Sent via CreatorDeal — Sponsorship Management for Creators</p>
              </div>
            </div>
          `,
        })
      }

      await admin.from("notifications").insert({
        user_id: input.userId,
        type: "system",
        title: "Payment Confirmed",
        message: "Your Creator Club subscription has been confirmed. Enjoy your upgraded features!",
      })

      return { success: true }
    }),

  rejectPayment: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(ctx)
      const admin = createAdminClient()
      const { error } = await admin
        .from("profiles")
        .update({
          plan: "free",
          subscription_status: "inactive",
          payment_pending: false,
          payment_order_id: null,
          payment_submitted_at: null,
        })
        .eq("id", input.userId)

      if (error) throw error

      await admin.from("notifications").insert({
        user_id: input.userId,
        type: "system",
        title: "Payment Not Verified",
        message: "Your payment could not be verified. Your account has been reverted to the Free plan. Please contact support if you believe this is an error.",
      })

      return { success: true }
    }),
})
