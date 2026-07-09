import { z } from "zod"
import { router, protectedProcedure } from "../server"

export const notificationPreferencesRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single()

    // Return defaults if no preferences exist
    if (error || !data) {
      return {
        email_deadline_7d: true,
        email_deadline_3d: true,
        email_deadline_1d: true,
        email_deadline_today: true,
        email_payment_7d: true,
        email_payment_today: true,
        email_payment_overdue: true,
        email_deal_update: true,
        remind_deadline_7d: true,
        remind_deadline_3d: true,
        remind_deadline_1d: true,
        remind_deadline_today: true,
      }
    }

    return data
  }),

  update: protectedProcedure
    .input(
      z.object({
        email_deadline_7d: z.boolean().optional(),
        email_deadline_3d: z.boolean().optional(),
        email_deadline_1d: z.boolean().optional(),
        email_deadline_today: z.boolean().optional(),
        email_payment_7d: z.boolean().optional(),
        email_payment_today: z.boolean().optional(),
        email_payment_overdue: z.boolean().optional(),
        email_deal_update: z.boolean().optional(),
        remind_deadline_7d: z.boolean().optional(),
        remind_deadline_3d: z.boolean().optional(),
        remind_deadline_1d: z.boolean().optional(),
        remind_deadline_today: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", ctx.user.id)
        .single()

      if (existing) {
        const { error } = await ctx.supabase
          .from("notification_preferences")
          .update({ ...input, updated_at: new Date().toISOString() })
          .eq("user_id", ctx.user.id)

        if (error) throw error
      } else {
        const { error } = await ctx.supabase
          .from("notification_preferences")
          .insert({ user_id: ctx.user.id, ...input })

        if (error) throw error
      }

      return { success: true }
    }),
})
