import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const paymentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("payments")
      .select("*, invoices(invoice_number, amount, deals(title, brands(name)))")
      .eq("user_id", ctx.user.id)
      .order("paid_at", { ascending: false })

    if (error) throw error
    return data
  }),

  create: protectedProcedure
    .input(
      z.object({
        invoice_id: z.string().uuid(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        payment_method: z.string().optional(),
        reference_number: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: invoice, error: invoiceError } = await ctx.supabase
        .from("invoices")
        .select("id, amount, amount_paid, user_id, deal_id")
        .eq("id", input.invoice_id)
        .eq("user_id", ctx.user.id)
        .single()

      if (invoiceError || !invoice) {
        throw new Error("Invoice not found")
      }

      const newAmountPaid = (invoice.amount_paid || 0) + input.amount
      if (newAmountPaid > (invoice.amount || 0)) {
        throw new Error("Payment amount exceeds invoice balance")
      }

      const { data: payment, error: paymentError } = await ctx.supabase
        .from("payments")
        .insert({
          invoice_id: input.invoice_id,
          user_id: ctx.user.id,
          amount: input.amount,
          currency: input.currency,
          payment_method: input.payment_method,
          reference_number: input.reference_number,
          notes: input.notes,
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      const newStatus = newAmountPaid >= (invoice.amount || 0) ? "paid" : "partial"
      await ctx.supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus === "paid" ? "paid" : undefined,
          paid_at: newStatus === "paid" ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.invoice_id)

      if (invoice.deal_id && newStatus === "paid") {
        await ctx.supabase
          .from("deals")
          .update({ stage: "paid", updated_at: new Date().toISOString() })
          .eq("id", invoice.deal_id)

        await ctx.supabase.from("notifications").insert({
          user_id: ctx.user.id,
          type: "payment",
          title: "Payment received",
          message: `Invoice paid - $${input.amount.toLocaleString()}`,
          deal_id: invoice.deal_id,
        })
      }

      return payment
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("payments")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
    }),
})
