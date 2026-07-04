import { router, protectedProcedure } from "../server"
import { z } from "zod"

function getFollowerTier(count: number): string {
  if (count >= 1000000) return "mega"
  if (count >= 100000) return "macro"
  if (count >= 10000) return "mid"
  if (count >= 1000) return "micro"
  return "nano"
}

export const ratesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("rate_history")
      .select("*, deals(title, brands(name))")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }),

  create: protectedProcedure
    .input(
      z.object({
        deal_id: z.string().uuid().optional(),
        platform: z.string().min(1),
        deliverable_type: z.string().min(1),
        follower_count: z.number().int().positive().optional(),
        engagement_rate: z.number().min(0).max(100).optional(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("rate_history")
        .insert({
          user_id: ctx.user.id,
          ...input,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  getStats: protectedProcedure
    .input(
      z.object({
        platform: z.string(),
        follower_count: z.number().optional(),
        deliverable_type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tier = getFollowerTier(input.follower_count || 50000)
      const contentType = input.deliverable_type || "video"

      // 1. Try crowdsourced aggregates first
      const { data: aggregates } = await ctx.supabase
        .from("rate_aggregates")
        .select("*")
        .eq("platform", input.platform)
        .eq("follower_tier", tier)
        .eq("deliverable_type", contentType)
        .single()

      if (aggregates && aggregates.sample_count >= 30) {
        return {
          source: "crowdsourced" as const,
          benchmark: {
            min_rate: aggregates.p10_rate,
            p25_rate: aggregates.p25_rate,
            median_rate: aggregates.median_rate,
            p75_rate: aggregates.p75_rate,
            max_rate: aggregates.p90_rate,
          },
          sampleCount: aggregates.sample_count,
          tier,
        }
      }

      // 2. Fall back to pre-seeded industry benchmarks
      const { data: benchmarks } = await ctx.supabase
        .from("rate_benchmarks")
        .select("*")
        .eq("platform", input.platform)
        .eq("follower_tier", tier)
        .eq("deliverable_type", contentType)
        .single()

      if (benchmarks) {
        return {
          source: "industry_report" as const,
          benchmark: {
            min_rate: benchmarks.min_rate,
            p25_rate: benchmarks.p25_rate,
            median_rate: benchmarks.median_rate,
            p75_rate: benchmarks.p75_rate,
            max_rate: benchmarks.max_rate,
          },
          sampleCount: 0,
          tier,
        }
      }

      // 3. No data at all
      return {
        source: "none" as const,
        benchmark: null,
        sampleCount: 0,
        tier,
      }
    }),

  // Legacy getStats for backward compatibility (user's own data only)
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("rate_history")
      .select("platform, amount, follower_count, engagement_rate")
      .eq("user_id", ctx.user.id)

    if (error) throw error

    const byPlatform: Record<string, { total: number; count: number; rates: number[] }> = {}
    for (const r of data) {
      if (!byPlatform[r.platform]) {
        byPlatform[r.platform] = { total: 0, count: 0, rates: [] }
      }
      byPlatform[r.platform].total += r.amount
      byPlatform[r.platform].count += 1
      byPlatform[r.platform].rates.push(r.amount)
    }

    const stats = Object.entries(byPlatform).map(([platform, d]) => ({
      platform,
      avgRate: d.total / d.count,
      totalDeals: d.count,
      medianRate: d.rates.sort((a, b) => a - b)[Math.floor(d.rates.length / 2)],
    }))

    return stats
  }),
})
