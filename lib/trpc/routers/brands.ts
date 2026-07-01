import { z } from "zod"
import { router, protectedProcedure } from "../server"

export const brandsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("brands")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("name")

    if (error) throw error
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("brands")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single()

      if (error) throw error
      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        logo_url: z.string().optional(),
        website: z.string().optional(),
        contact_name: z.string().optional(),
        contact_email: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("brands")
        .insert({
          ...input,
          user_id: ctx.user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        logo_url: z.string().nullable().optional(),
        website: z.string().nullable().optional(),
        contact_name: z.string().nullable().optional(),
        contact_email: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const { data, error } = await ctx.supabase
        .from("brands")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", ctx.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("brands")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
      return { success: true }
    }),
})
