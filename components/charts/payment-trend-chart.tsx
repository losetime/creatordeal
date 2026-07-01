"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "Jan", received: 8000, pending: 4000 },
  { month: "Feb", received: 12000, pending: 3000 },
  { month: "Mar", received: 15000, pending: 3000 },
  { month: "Apr", received: 10000, pending: 4000 },
  { month: "May", received: 18000, pending: 4000 },
  { month: "Jun", received: 12000, pending: 3200 },
]

const chartConfig = {
  received: {
    label: "Received",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(47.9 95.8% 53.1%)",
  },
} satisfies ChartConfig

export function PaymentTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Trend</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Tooltip content={<ChartTooltipContent />} />
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
      </CardContent>
    </Card>
  )
}
