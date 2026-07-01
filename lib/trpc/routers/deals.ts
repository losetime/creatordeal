import { z } from "zod"
import { router, protectedProcedure } from "../server"

export const dealsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("deals")
      .select("*, brands(*)")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("deals")
        .select("*, brands(*), deliverables(*), contracts(*)")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single()

      if (error) throw error
      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        brand_id: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().default("USD"),
        content_type: z.string().optional(),
        content_deadline: z.string().optional(),
        payment_deadline: z.string().optional(),
        payment_terms: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("deals")
        .insert({
          ...input,
          user_id: ctx.user.id,
          stage: "inquiry",
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
        title: z.string().optional(),
        brand_id: z.string().nullable().optional(),
        amount: z.number().nullable().optional(),
        currency: z.string().optional(),
        content_type: z.string().nullable().optional(),
        content_deadline: z.string().nullable().optional(),
        payment_deadline: z.string().nullable().optional(),
        payment_terms: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const { data, error } = await ctx.supabase
        .from("deals")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", ctx.user.id)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stage: z.enum([
          "inquiry",
          "negotiate",
          "signed",
          "creating",
          "review",
          "published",
          "paid",
          "closed",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("deals")
        .update({
          stage: input.stage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
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
        .from("deals")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
      return { success: true }
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { data: deals, error } = await ctx.supabase
      .from("deals")
      .select("stage, amount")
      .eq("user_id", ctx.user.id)

    if (error) throw error

    const totalDeals = deals.length
    const activeDeals = deals.filter(
      (d) => !["paid", "closed"].includes(d.stage)
    ).length
    const totalRevenue = deals
      .filter((d) => d.stage === "paid")
      .reduce((sum, d) => sum + (d.amount || 0), 0)
    const pendingAmount = deals
      .filter((d) => ["signed", "creating", "review", "published"].includes(d.stage))
      .reduce((sum, d) => sum + (d.amount || 0), 0)

    return {
      totalDeals,
      activeDeals,
      totalRevenue,
      pendingAmount,
    }
  }),
})
