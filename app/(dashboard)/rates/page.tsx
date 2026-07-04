"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  BarChart3,
  Loader2,
  Plus,
  Info,
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"

const platforms = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
] as const

const deliverableTypes = [
  { value: "video", label: "Video" },
  { value: "post", label: "Post" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel" },
] as const

const getFollowerTier = (count: number) => {
  if (count >= 1000000) return { label: "Mega", range: "1M+" }
  if (count >= 100000) return { label: "Macro", range: "100K-1M" }
  if (count >= 10000) return { label: "Mid", range: "10K-100K" }
  if (count >= 1000) return { label: "Micro", range: "1K-10K" }
  return { label: "Nano", range: "<1K" }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-1.5">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Rate Benchmarking</h2>
            <p className="text-xs text-teal-100">See how your rates compare to market standards</p>
          </div>
        </div>
      </div>
      <Card className="shadow-card border-0">
        <CardContent className="p-6 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-9 bg-slate-200 rounded w-28 animate-pulse" />
            <div className="h-9 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-9 bg-slate-200 rounded w-32 animate-pulse" />
          </div>
        </CardContent>
      </Card>
      {[1, 2].map((i) => (
        <Card key={i} className="shadow-card border-0">
          <CardContent className="p-6 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function RatesPage() {
  const [followerCount, setFollowerCount] = useState("50000")
  const [platform, setPlatform] = useState("youtube")
  const [deliverableType, setDeliverableType] = useState("video")
  const [yourRate, setYourRate] = useState("5000")

  const { data: ratesData, isLoading: ratesLoading } = trpc.rates.list.useQuery()
  const { data: benchmarkData, isLoading: benchmarkLoading } = trpc.rates.getStats.useQuery({
    platform,
    follower_count: parseInt(followerCount) || undefined,
    deliverable_type: deliverableType,
  })
  const { data: myStatsData } = trpc.rates.getMyStats.useQuery()

  const utils = trpc.useUtils()

  const createRate = trpc.rates.create.useMutation({
    onSuccess: () => {
      toast.success("Rate saved")
      utils.rates.list.invalidate()
      utils.rates.getMyStats.invalidate()
    },
    onError: (err) => {
      toast.error("Failed to save rate", { description: err.message })
    },
  })

  const isLoading = ratesLoading || benchmarkLoading

  if (isLoading) return <LoadingSkeleton />

  const benchmark = benchmarkData?.benchmark
  const marketMedian = benchmark?.median_rate ?? 0
  const marketP25 = benchmark?.p25_rate ?? 0
  const marketP75 = benchmark?.p75_rate ?? 0
  const dataSource = benchmarkData?.source
  const sampleCount = benchmarkData?.sampleCount ?? 0

  const rate = parseInt(yourRate) || 0

  const getRateComparison = (yourRate: number, median: number) => {
    if (median === 0) return { icon: Minus, color: "text-slate-400", text: "No market data yet" }
    const diff = ((yourRate - median) / median) * 100
    if (diff > 10) return { icon: TrendingUp, color: "text-green-600", text: `${Math.abs(Math.round(diff))}% above market` }
    if (diff < -10) return { icon: TrendingDown, color: "text-red-600", text: `${Math.abs(Math.round(diff))}% below market` }
    return { icon: Minus, color: "text-yellow-600", text: "At market rate" }
  }

  const comparison = getRateComparison(rate, marketMedian)
  const ComparisonIcon = comparison.icon

  const getSuggestion = () => {
    if (marketMedian === 0) {
      return "No benchmark data available for this combination yet."
    }
    const diff = ((rate - marketMedian) / marketMedian) * 100
    if (diff < -10) {
      const suggestedIncrease = Math.round((marketMedian - rate) * 0.8)
      return `Consider increasing your rate by ${formatCurrency(suggestedIncrease)} to be more competitive.`
    }
    if (diff > 20) {
      return "Your rate is well above market. Make sure you're delivering premium value to justify this."
    }
    return "Your rate is competitive. Keep focusing on quality content."
  }

  const tier = getFollowerTier(parseInt(followerCount) || 50000)

  // Calculate bar widths relative to P75 (or max if no P75)
  const scaleMax = marketP75 > 0 ? marketP75 * 1.2 : Math.max(rate, 1)

  const handleSaveRate = () => {
    createRate.mutate({
      platform,
      deliverable_type: deliverableType,
      follower_count: parseInt(followerCount) || undefined,
      amount: rate,
      currency: "USD",
    })
  }

  const getDataSourceLabel = () => {
    if (dataSource === "crowdsourced") return `Based on ${sampleCount} deals from platform creators`
    if (dataSource === "industry_report") return "Based on industry benchmarks (Influencer Marketing Hub 2025-2026)"
    return "No data available"
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-1.5">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Rate Benchmarking</h2>
            <p className="text-xs text-teal-100">See how your rates compare to market standards</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Details</CardTitle>
          <CardDescription>Enter your profile to get personalized benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm">Platform</Label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm h-9"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliverableType" className="text-sm">Content Type</Label>
              <select
                id="deliverableType"
                value={deliverableType}
                onChange={(e) => setDeliverableType(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm h-9"
              >
                {deliverableTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followers" className="text-sm">Followers</Label>
              <Input
                id="followers"
                type="number"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                className="w-32 h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yourRate" className="text-sm">Your Rate ($)</Label>
              <Input
                id="yourRate"
                type="number"
                value={yourRate}
                onChange={(e) => setYourRate(e.target.value)}
                className="w-32 h-9"
              />
            </div>
            <Button
              className="bg-teal-600 hover:bg-teal-700 h-9"
              onClick={handleSaveRate}
              disabled={createRate.isPending}
            >
              {createRate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Save & Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Comparison */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {platforms.find((p) => p.value === platform)?.label} — {tier.label} Tier ({tier.range})
              </CardTitle>
              <CardDescription className="text-xs">
                {getDataSourceLabel()}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-1.5 ${comparison.color}`}>
              <ComparisonIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{comparison.text}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketMedian === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No benchmark data available for this combination.</p>
            </div>
          ) : (
            <>
              {/* Visual Comparison Bars */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs font-medium">You</span>
                  <div className="flex-1">
                    <div className="h-7 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (rate / scaleMax) * 100)}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(rate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs text-muted-foreground">Market</span>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (marketMedian / scaleMax) * 100)}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(marketMedian)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* P25-P75 Range */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs text-muted-foreground">Range</span>
                  <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatCurrency(marketP25)}</span>
                    <span className="text-slate-300">—</span>
                    <span>{formatCurrency(marketP75)}</span>
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      25th-75th percentile
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Suggestion */}
              <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg">
                <Lightbulb className="h-4 w-4 text-teal-600 mt-0.5" />
                <p className="text-sm">{getSuggestion()}</p>
              </div>

              {/* Data Source Note */}
              {dataSource === "industry_report" && (
                <div className="flex items-start gap-2 p-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 mt-0.5" />
                  <p>Industry benchmarks are approximate ranges. Actual rates vary by engagement, niche, and audience demographics.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Rate History */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rate History</CardTitle>
          <CardDescription>Your past rates and deals</CardDescription>
        </CardHeader>
        <CardContent>
          {!ratesData || ratesData.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              No rates yet. Add your first rate above.
            </div>
          ) : (
            <div className="space-y-2">
              {ratesData.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(entry.amount, entry.currency ?? "USD")}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{entry.platform}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">{entry.deliverable_type}</span>
                    {entry.deals && (
                      <span className="text-xs text-muted-foreground">
                        — {entry.deals.title}
                        {entry.deals.brands?.name && ` · ${entry.deals.brands.name}`}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Factors Card */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Factors Affecting Your Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Follower Tier</p>
              <p className="font-medium text-sm">{tier.label} ({tier.range})</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="font-medium text-sm">
                {platforms.find((p) => p.value === platform)?.label}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Content Type</p>
              <p className="font-medium text-sm">
                {deliverableTypes.find((t) => t.value === deliverableType)?.label}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground">Market Median</p>
              <p className="font-medium text-sm">
                {marketMedian > 0 ? formatCurrency(marketMedian) : "No data"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
