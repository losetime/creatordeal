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

  // Submit Ko-fi payment for manual verification
  submitKofiPayment: protectedProcedure
    .input(z.object({ orderId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .update({
          payment_pending: true,
          payment_order_id: input.orderId,
          payment_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
