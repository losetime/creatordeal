import { z } from "zod"
import { router, protectedProcedure } from "../server"

export const invoicesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("invoices")
      .select("*, deals(title, brands(name))")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("invoices")
        .select("*, deals(*, brands(*))")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single()

      if (error) throw error
      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        deal_id: z.string(),
        amount: z.number(),
        currency: z.string().default("USD"),
        due_date: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoiceNumber = `INV-${Date.now()}`
      
      const { data, error } = await ctx.supabase
        .from("invoices")
        .insert({
          ...input,
          user_id: ctx.user.id,
          invoice_number: invoiceNumber,
          status: "draft",
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
        amount: z.number().optional(),
        due_date: z.string().optional(),
        status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const { data, error } = await ctx.supabase
        .from("invoices")
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
        .from("invoices")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
      return { success: true }
    }),
})
