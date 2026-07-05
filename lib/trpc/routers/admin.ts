import { router, protectedProcedure } from "../server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"

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
      const { error } = await admin
        .from("profiles")
        .update({
          payment_pending: false,
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmed_by: ctx.user.id,
        })
        .eq("id", input.userId)

      if (error) throw error

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
