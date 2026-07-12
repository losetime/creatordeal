import { z } from "zod"
import { router, protectedProcedure } from "../server"

const VALID_STAGE_TRANSITIONS: Record<string, string[]> = {
  inquiry: ["negotiate", "closed"],
  negotiate: ["signed", "closed"],
  signed: ["creating"],
  creating: ["review"],
  review: ["published", "creating"],
  published: ["paid", "closed"],
  paid: ["closed"],
  closed: [],
}

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
        title: z.string().min(1).max(200),
        brand_id: z.string().optional(),
        amount: z.number().positive().optional(),
        currency: z.string().default("USD"),
        content_type: z.string().optional(),
        content_deadline: z.string().optional(),
        payment_deadline: z.string().optional(),
        payment_terms: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check plan limits for free users
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("plan")
        .eq("id", ctx.user.id)
        .single()

      if (profile?.plan === "free") {
        // Count active deals (not closed)
        const { count } = await ctx.supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", ctx.user.id)
          .neq("stage", "closed")

        if (count && count >= 3) {
          throw new Error("Free plan is limited to 3 active deals. Please upgrade to Creator Club for unlimited deals.")
        }
      }

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

      await ctx.supabase.from("notifications").insert({
        user_id: ctx.user.id,
        type: "deal_update",
        title: "New deal created",
        message: `"${input.title}" has been added to your pipeline`,
        deal_id: data.id,
      })

      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        brand_id: z.string().nullable().optional(),
        amount: z.number().positive().nullable().optional(),
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
          "inquiry", "negotiate", "signed", "creating",
          "review", "published", "paid", "closed",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: currentDeal, error: fetchError } = await ctx.supabase
        .from("deals")
        .select("stage, title, amount, currency, payment_deadline")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single()

      if (fetchError || !currentDeal) {
        throw new Error("Deal not found")
      }

      const allowed = VALID_STAGE_TRANSITIONS[currentDeal.stage] || []
      if (!allowed.includes(input.stage)) {
        throw new Error(`Cannot move from "${currentDeal.stage}" to "${input.stage}"`)
      }

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

      // Auto-create invoice when moving to "published"
      if (input.stage === "published" && currentDeal.amount) {
        // Check if invoice already exists for this deal
        const { data: existingInvoice } = await ctx.supabase
          .from("invoices")
          .select("id")
          .eq("deal_id", input.id)
          .eq("user_id", ctx.user.id)
          .limit(1)
          .single()

        if (!existingInvoice) {
          // Generate invoice number
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, "0")
          const timestamp = Date.now().toString(36).toUpperCase()
          const invoiceNumber = `INV-${year}${month}-${timestamp}`

          // Create draft invoice
          const dueDate = currentDeal.payment_deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

          await ctx.supabase.from("invoices").insert({
            deal_id: input.id,
            user_id: ctx.user.id,
            invoice_number: invoiceNumber,
            amount: currentDeal.amount,
            currency: currentDeal.currency || "USD",
            status: "draft",
            due_date: dueDate,
          })

          // Add notification
          await ctx.supabase.from("notifications").insert({
            user_id: ctx.user.id,
            type: "deal_update",
            title: "Invoice auto-created",
            message: `Draft invoice ${invoiceNumber} created for $${currentDeal.amount.toLocaleString()}`,
            deal_id: input.id,
          })
        }
      }

      const stageLabels: Record<string, string> = {
        signed: "Deal signed!",
        published: "Content published",
        paid: "Payment received",
        closed: "Deal closed",
      }

      if (stageLabels[input.stage]) {
        await ctx.supabase.from("notifications").insert({
          user_id: ctx.user.id,
          type: "deal_update",
          title: stageLabels[input.stage],
          message: `"${currentDeal.title}" moved to ${input.stage}`,
          deal_id: input.id,
        })
      }

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
