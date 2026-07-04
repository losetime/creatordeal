import { z } from "zod"
import { router, protectedProcedure } from "../server"

const VALID_INVOICE_TRANSITIONS: Record<string, string[]> = {
  draft: ["sent", "cancelled"],
  sent: ["viewed", "paid", "overdue", "cancelled"],
  viewed: ["paid", "overdue", "cancelled"],
  partial: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
}

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
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        due_date: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const timestamp = Date.now().toString(36).toUpperCase()
      const invoiceNumber = `INV-${year}${month}-${timestamp}`

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

      await ctx.supabase.from("notifications").insert({
        user_id: ctx.user.id,
        type: "deal_update",
        title: "Invoice created",
        message: `${invoiceNumber} for $${input.amount.toLocaleString()}`,
        deal_id: input.deal_id,
      })

      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        due_date: z.string().optional(),
        status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled", "partial"]).optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      if (updateData.status) {
        const { data: current } = await ctx.supabase
          .from("invoices")
          .select("status")
          .eq("id", id)
          .eq("user_id", ctx.user.id)
          .single()

        if (current) {
          const allowed = VALID_INVOICE_TRANSITIONS[current.status] || []
          if (!allowed.includes(updateData.status)) {
            throw new Error(`Cannot change from "${current.status}" to "${updateData.status}"`)
          }
        }
      }

      if (updateData.status === "paid") {
        ;(updateData as any).paid_at = new Date().toISOString()
      }

      const { data, error } = await ctx.supabase
        .from("invoices")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", ctx.user.id)
        .select()
        .single()

      if (error) throw error

      if (updateData.status === "sent") {
        await ctx.supabase.from("notifications").insert({
          user_id: ctx.user.id,
          type: "deal_update",
          title: "Invoice sent",
          message: `${data.invoice_number} has been sent`,
          deal_id: data.deal_id,
        })
      }

      if (updateData.status === "overdue") {
        await ctx.supabase.from("notifications").insert({
          user_id: ctx.user.id,
          type: "payment",
          title: "Invoice overdue",
          message: `${data.invoice_number} is past due`,
          deal_id: data.deal_id,
        })
      }

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

  checkOverdue: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date().toISOString()
    const { data: overdueInvoices } = await ctx.supabase
      .from("invoices")
      .select("id, invoice_number, deal_id")
      .eq("user_id", ctx.user.id)
      .in("status", ["sent", "viewed"])
      .lt("due_date", now)

    if (overdueInvoices && overdueInvoices.length > 0) {
      for (const inv of overdueInvoices) {
        await ctx.supabase
          .from("invoices")
          .update({ status: "overdue", updated_at: now })
          .eq("id", inv.id)
          .eq("user_id", ctx.user.id)

        await ctx.supabase.from("notifications").insert({
          user_id: ctx.user.id,
          type: "payment",
          title: "Invoice overdue",
          message: `${inv.invoice_number} is past due`,
          deal_id: inv.deal_id,
        })
      }
    }

    return { updated: overdueInvoices?.length || 0 }
  }),
})
