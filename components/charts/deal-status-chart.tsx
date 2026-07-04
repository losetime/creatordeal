"use client"

import { Pie, PieChart, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DealStatusChartProps {
  data?: { stage: string; count: number }[]
}

const STAGE_COLORS: Record<string, string> = {
  inquiry: "var(--color-chart-1)",
  negotiate: "var(--color-chart-2)",
  signed: "var(--color-chart-3)",
  creating: "var(--color-chart-4)",
  review: "var(--color-chart-5)",
  published: "var(--color-chart-1)",
  paid: "var(--color-chart-3)",
  closed: "var(--color-chart-2)",
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
