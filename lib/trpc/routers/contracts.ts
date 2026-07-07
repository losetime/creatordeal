import { router, protectedProcedure } from "../server"
import { z } from "zod"

export const contractsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("contracts")
      .select("*, deals!inner(title, user_id, brands(name))")
      .eq("deals.user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("contracts")
        .select("*, deals!inner(*, brands(*))")
        .eq("id", input.id)
        .eq("deals.user_id", ctx.user.id)
        .single()

      if (error) throw error
      return data
    }),

  getFileUrl: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: contract, error } = await ctx.supabase
        .from("contracts")
        .select("file_name")
        .eq("id", input.id)
        .single()

      if (error || !contract) {
        throw new Error("Contract not found")
      }

      // Search user's folder recursively for matching file
      const userId = ctx.user.id
      const { data: folders } = await ctx.supabase.storage.from("contracts").list(userId, { limit: 100 })

      if (!folders) {
        throw new Error("Could not list storage")
      }

      // Check each subfolder
      for (const folder of folders) {
        const { data: files } = await ctx.supabase.storage.from("contracts").list(`${userId}/${folder.name}`, { limit: 100 })
        if (files) {
          const match = files.find(f => f.name.includes(contract.file_name) || contract.file_name.includes(f.name.replace(/^\d+-/, '')))
          if (match) {
            const fullPath = `${userId}/${folder.name}/${match.name}`
            const { data: newUrl } = await ctx.supabase.storage.from("contracts").createSignedUrl(fullPath, 3600)
            return { url: newUrl?.signedUrl || "" }
          }
        }
      }

      // Fallback: try to create URL with a constructed path
      const { data: allFiles } = await ctx.supabase.storage.from("contracts").list("", { limit: 500, search: contract.file_name.split(".")[0] })
      if (allFiles && allFiles.length > 0) {
        const match = allFiles[0]
        // Reconstruct full path from metadata
        const { data: newUrl } = await ctx.supabase.storage.from("contracts").createSignedUrl(match.fullPath || match.name, 3600)
        return { url: newUrl?.signedUrl || "" }
      }

      throw new Error("File not found in storage")
    }),

  create: protectedProcedure
    .input(
      z.object({
        deal_id: z.string().uuid(),
        file_name: z.string().min(1),
        file_url: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: deal, error: dealError } = await ctx.supabase
        .from("deals")
        .select("id")
        .eq("id", input.deal_id)
        .eq("user_id", ctx.user.id)
        .single()

      if (dealError || !deal) {
        throw new Error("Deal not found or access denied")
      }

      const { data, error } = await ctx.supabase
        .from("contracts")
        .insert({
          deal_id: input.deal_id,
          file_name: input.file_name,
          file_url: input.file_url,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  updateAnalysis: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        ai_summary: z.any().optional(),
        risks: z.any().optional(),
        key_terms: z.any().optional(),
        usage_rights: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: existing, error: fetchError } = await ctx.supabase
        .from("contracts")
        .select("id, deals!inner(user_id)")
        .eq("id", input.id)
        .single()

      if (fetchError || !existing || (existing.deals as any).user_id !== ctx.user.id) {
        throw new Error("Contract not found or access denied")
      }

      const { id, ...updates } = input
      const { error } = await ctx.supabase
        .from("contracts")
        .update(updates)
        .eq("id", id)

      if (error) throw error
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: existing, error: fetchError } = await ctx.supabase
        .from("contracts")
        .select("id, deals!inner(user_id)")
        .eq("id", input.id)
        .single()

      if (fetchError || !existing || (existing.deals as any).user_id !== ctx.user.id) {
        throw new Error("Contract not found or access denied")
      }

      const { error } = await ctx.supabase
        .from("contracts")
        .delete()
        .eq("id", input.id)

      if (error) throw error
    }),
})
