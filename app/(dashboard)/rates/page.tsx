"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react"

const mockBenchmarks = [
  {
    platform: "YouTube",
    deliverable: "Integration (60-90s)",
    yourRate: 5000,
    marketMedian: 5200,
    p25: 3500,
    p75: 7200,
    factors: { followers: "50K", engagement: "4.2%", niche: "Tech" },
  },
  {
    platform: "Instagram",
    deliverable: "Feed Post",
    yourRate: 2500,
    marketMedian: 3200,
    p25: 1800,
    p75: 4800,
    factors: { followers: "50K", engagement: "3.8%", niche: "Tech" },
  },
  {
    platform: "TikTok",
    deliverable: "Video (30-60s)",
    yourRate: 1800,
    marketMedian: 2400,
    p25: 1200,
    p75: 3600,
    factors: { followers: "50K", engagement: "5.1%", niche: "Tech" },
  },
]

export default function RatesPage() {
  const [followerCount, setFollowerCount] = useState("50000")
  const [platform, setPlatform] = useState("youtube")

  const getRateComparison = (yourRate: number, median: number) => {
    const diff = ((yourRate - median) / median) * 100
    if (diff > 10) return { icon: TrendingUp, color: "text-green-600", text: `${Math.abs(Math.round(diff))}% above market` }
    if (diff < -10) return { icon: TrendingDown, color: "text-red-600", text: `${Math.abs(Math.round(diff))}% below market` }
    return { icon: Minus, color: "text-yellow-600", text: "At market rate" }
  }

  const getSuggestion = (yourRate: number, median: number) => {
    const diff = ((yourRate - median) / median) * 100
    if (diff < -10) {
      const suggestedIncrease = Math.round((median - yourRate) * 0.8)
      return `Consider increasing your rate by $${suggestedIncrease.toLocaleString()} to be more competitive.`
    }
    if (diff > 20) {
      return "Your rate is well above market. Make sure you're delivering premium value."
    }
    return "Your rate is competitive. Keep focusing on quality content."
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rate Benchmarking</h2>
        <p className="text-muted-foreground">
          See how your rates compare to market standards
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>
            Enter your profile to get personalized benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followers">Followers</Label>
              <Input
                id="followers"
                type="number"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex items-end">
              <Button>Get Benchmark</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <div className="space-y-4">
        {mockBenchmarks.map((benchmark, index) => {
          const comparison = getRateComparison(benchmark.yourRate, benchmark.marketMedian)
          const ComparisonIcon = comparison.icon
          const suggestion = getSuggestion(benchmark.yourRate, benchmark.marketMedian)
          
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{benchmark.platform} - {benchmark.deliverable}</CardTitle>
                    <CardDescription>
                      Based on {benchmark.factors.followers} followers, {benchmark.factors.engagement} engagement
                    </CardDescription>
                  </div>
                  <div className={`flex items-center gap-2 ${comparison.color}`}>
                    <ComparisonIcon className="h-5 w-5" />
                    <span className="font-medium">{comparison.text}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rate Bar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm font-medium">You</span>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-lg flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.min(100, (benchmark.yourRate / benchmark.p75) * 100)}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-primary-foreground">
                            ${benchmark.yourRate.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm text-muted-foreground">Market</span>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded-lg relative overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-lg flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.min(100, (benchmark.marketMedian / benchmark.p75) * 100)}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-white">
                            ${benchmark.marketMedian.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm text-muted-foreground">25th</span>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded-lg relative overflow-hidden">
                        <div
                          className="h-full bg-blue-300 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, (benchmark.p25 / benchmark.p75) * 100)}%` }}
                        >
                          <span className="text-xs">${benchmark.p25.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm text-muted-foreground">75th</span>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded-lg relative overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: "100%" }}
                        >
                          <span className="text-xs text-white">${benchmark.p75.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Factors Affecting Your Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="font-medium">50K (Medium)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="font-medium">4.2% (Above Avg)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">YouTube (Higher rates)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Niche</p>
              <p className="font-medium">Tech (Highest rates)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
