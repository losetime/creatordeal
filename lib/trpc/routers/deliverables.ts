import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const deliverablesRouter = router({
  list: protectedProcedure
    .input(z.object({ deal_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify deal ownership
      const { data: deal } = await ctx.supabase
        .from("deals")
        .select("id")
        .eq("id", input.deal_id)
        .eq("user_id", ctx.user.id)
        .single()

      if (!deal) throw new Error("Deal not found")

      const { data, error } = await ctx.supabase
        .from("deliverables")
        .select("*")
        .eq("deal_id", input.deal_id)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        deal_id: z.string().uuid(),
        type: z.string().min(1),
        description: z.string().optional(),
        quantity: z.number().int().positive().default(1),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: deal } = await ctx.supabase
        .from("deals")
        .select("id")
        .eq("id", input.deal_id)
        .eq("user_id", ctx.user.id)
        .single()

      if (!deal) throw new Error("Deal not found")

      const { data, error } = await ctx.supabase
        .from("deliverables")
        .insert({
          deal_id: input.deal_id,
          type: input.type,
          description: input.description,
          quantity: input.quantity,
          deadline: input.deadline || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        type: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        deadline: z.string().optional(),
        status: z.enum(["pending", "in_progress", "submitted", "approved", "rejected"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("deliverables")
        .select("id, deals!inner(user_id)")
        .eq("id", input.id)
        .single()

      if (!existing || (existing.deals as any).user_id !== ctx.user.id) {
        throw new Error("Deliverable not found")
      }

      const { id, ...updates } = input
      const { error } = await ctx.supabase
        .from("deliverables")
        .update(updates)
        .eq("id", id)

      if (error) throw error
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase
        .from("deliverables")
        .select("id, deals!inner(user_id)")
        .eq("id", input.id)
        .single()

      if (!existing || (existing.deals as any).user_id !== ctx.user.id) {
        throw new Error("Deliverable not found")
      }

      const { error } = await ctx.supabase
        .from("deliverables")
        .delete()
        .eq("id", input.id)

      if (error) throw error
    }),
})
