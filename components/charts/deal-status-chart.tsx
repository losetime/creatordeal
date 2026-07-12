"use client"

import { Pie, PieChart, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DealStatusChartProps {
  data?: { stage: string; count: number }[]
}

const STAGE_COLORS: Record<string, string> = {
  inquiry: "#3b82f6",      // blue-500
  negotiate: "#f59e0b",    // amber-500
  signed: "#10b981",       // emerald-500
  creating: "#8b5cf6",     // violet-500
  review: "#f97316",       // orange-500
  published: "#06b6d4",    // cyan-500
  paid: "#14b8a6",         // teal-500
  closed: "#9ca3af",       // slate-400
}

const chartConfig = {
  count: {
    label: "Deals",
  },
} satisfies ChartConfig

export function DealStatusChart({ data = [] }: DealStatusChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fill: STAGE_COLORS[d.stage] || "var(--color-chart-1)",
  }))

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-base">Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No deals yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="count"
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
        )}
      </CardContent>
    </Card>
  )
}
