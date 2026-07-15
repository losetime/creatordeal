"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RevenueChartProps {
  data?: { month: string; amount: number }[]
}

const chartConfig = {
  amount: {
    label: "Revenue",
    color: "#0d9488",
  },
} satisfies ChartConfig

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Revenue (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No revenue data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={data}>
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
              <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
