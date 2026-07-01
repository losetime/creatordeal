"use client"

import { Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { stage: "Inquiry", deals: 4, fill: "var(--color-chart-1)" },
  { stage: "Negotiate", deals: 3, fill: "var(--color-chart-2)" },
  { stage: "Signed", deals: 2, fill: "var(--color-chart-3)" },
  { stage: "Creating", deals: 1, fill: "var(--color-chart-4)" },
  { stage: "Published", deals: 2, fill: "var(--color-chart-5)" },
]

const chartConfig = {
  deals: {
    label: "Deals",
  },
  Inquiry: {
    label: "Inquiry",
    color: "hsl(262.1 83.3% 57.8%)",
  },
  Negotiate: {
    label: "Negotiate",
    color: "hsl(217.2 91.2% 59.8%)",
  },
  Signed: {
    label: "Signed",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  Creating: {
    label: "Creating",
    color: "hsl(47.9 95.8% 53.1%)",
  },
  Published: {
    label: "Published",
    color: "hsl(0 84.2% 60.2%)",
  },
} satisfies ChartConfig

export function DealStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="deals"
              nameKey="stage"
              cx="50%"
              cy="50%"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
