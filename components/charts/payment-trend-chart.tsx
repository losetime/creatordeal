"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PaymentTrendChartProps {
  invoices?: { amount: number; status: string; created_at: string }[]
}

const chartConfig = {
  received: {
    label: "Received",
    color: "var(--color-chart-3)",
  },
  pending: {
    label: "Pending",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

export function PaymentTrendChart({ invoices = [] }: PaymentTrendChartProps) {
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthMap = new Map<string, { received: number; pending: number }>()

    invoices.forEach((inv) => {
      const date = new Date(inv.created_at)
      const key = monthNames[date.getMonth()]
      if (!monthMap.has(key)) monthMap.set(key, { received: 0, pending: 0 })
      const entry = monthMap.get(key)!
      if (inv.status === "paid") {
        entry.received += inv.amount || 0
      } else if (["draft", "sent", "viewed", "overdue"].includes(inv.status)) {
        entry.pending += inv.amount || 0
      }
    })

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
  }, [invoices])

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Payment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No payment data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="received"
                stroke="var(--color-received)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="var(--color-pending)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
