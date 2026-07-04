import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["deadline", "payment", "system", "deal_update"]),
        title: z.string().min(1),
        message: z.string().optional(),
        action_url: z.string().optional(),
        deal_id: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("notifications")
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", ctx.user.id)
      .eq("read", false)

    if (error) throw error
  }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("notifications")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)

      if (error) throw error
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.user.id)
      .eq("read", false)

    if (error) throw error
    return count ?? 0
  }),
})
