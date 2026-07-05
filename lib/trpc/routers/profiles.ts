import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const profilesRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single()

    if (error) throw error
    return data
  }),

  update: protectedProcedure
    .input(
      z.object({
        full_name: z.string().min(1).max(100).optional(),
        avatar_url: z.string().url().optional(),
        timezone: z.string().max(50).optional(),
        language: z.string().max(10).optional(),
        currency: z.string().max(3).optional(),
        plan: z.enum(["free", "pro", "team"]).optional(),
        subscription_status: z.string().optional(),
        payment_pending: z.boolean().optional(),
        payment_order_id: z.string().optional(),
        payment_submitted_at: z.string().optional(),
        payment_confirmed_at: z.string().optional(),
        payment_confirmed_by: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", ctx.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  updatePassword: protectedProcedure
    .input(z.object({ newPassword: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.updateUser({
        password: input.newPassword,
      })
      if (error) throw error
    }),
})
