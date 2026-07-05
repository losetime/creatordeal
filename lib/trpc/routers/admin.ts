import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const adminRouter = router({
  getPendingPayments: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, full_name, email, payment_pending, payment_order_id, payment_submitted_at")
      .eq("payment_pending", true)
      .order("payment_submitted_at", { ascending: false })

    if (error) throw error
    return data
  }),

  confirmPayment: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("profiles")
        .update({
          payment_pending: false,
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmed_by: ctx.user.id,
        })
        .eq("id", input.userId)

      if (error) throw error

      // Send notification to the user
      await ctx.supabase.from("notifications").insert({
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
      const { error } = await ctx.supabase
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

      // Send notification to the user
      await ctx.supabase.from("notifications").insert({
        user_id: input.userId,
        type: "system",
        title: "Payment Not Verified",
        message: "Your payment could not be verified. Your account has been reverted to the Free plan. Please contact support if you believe this is an error.",
      })

      return { success: true }
    }),
})
