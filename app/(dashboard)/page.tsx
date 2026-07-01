"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Handshake, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight,
  Download,
} from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Active Deals",
    value: "12",
    change: "+2 this week",
    icon: Handshake,
  },
  {
    title: "Revenue MTD",
    value: "$15,200",
    change: "+18% vs last month",
    icon: DollarSign,
  },
  {
    title: "Pending Payments",
    value: "$8,500",
    change: "3 overdue",
    icon: Clock,
  },
  {
    title: "Total Earned",
    value: "$45,200",
    change: "All time",
    icon: TrendingUp,
  },
]

const upcomingDeadlines = [
  { id: "1", title: "Nike Integration", brand: "Nike", due: "Tomorrow", urgent: true },
  { id: "2", title: "Apple Review", brand: "Apple", due: "In 3 days", urgent: false },
  { id: "3", title: "Samsung Script", brand: "Samsung", due: "In 7 days", urgent: false },
]

const recentActivity = [
  { id: "1", text: "Netflix payment received - $4,000", type: "success" },
  { id: "2", text: "Draft sent to Amazon - $2,500", type: "info" },
  { id: "3", text: "New deal from Tesla - $6,000", type: "new" },
]

const monthlyRevenue = [
  { month: "Jan", amount: 12000 },
  { month: "Feb", amount: 15000 },
  { month: "Mar", amount: 18000 },
  { month: "Apr", amount: 14000 },
  { month: "May", amount: 22000 },
  { month: "Jun", amount: 15200 },
]

export default function DashboardPage() {
  const exportRevenueCSV = () => {
    const headers = ["Month", "Revenue"]
    const rows = monthlyRevenue.map((r) => [r.month, r.amount])
    
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue (Last 6 Months)</CardTitle>
            <Button variant="outline" size="sm" onClick={exportRevenueCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-muted-foreground">{item.month}</span>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary rounded"
                        style={{ width: `${(item.amount / 25000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium">
                    ${(item.amount / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Link href="/deals">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deadline.brand}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      deadline.urgent
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {deadline.due}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "new"
                        ? "bg-blue-500"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <p className="text-sm">{activity.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/deals">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> New Deal
                </Button>
              </Link>
              <Link href="/invoices">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
              </Link>
              <Link href="/brands">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Brand
                </Button>
              </Link>
              <Link href="/payments">
                <Button className="w-full" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" /> View Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
