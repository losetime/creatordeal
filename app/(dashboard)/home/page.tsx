"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Handshake,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Download,
  Calendar,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { DealStatusChart } from "@/components/charts/deal-status-chart"
import { PaymentTrendChart } from "@/components/charts/payment-trend-chart"

export default function DashboardPage() {
  const { t } = useLocale()
  const { data: stats, isLoading: statsLoading } = trpc.deals.getStats.useQuery()
  const { data: deals, isLoading: dealsLoading } = trpc.deals.list.useQuery()
  const { data: notifications, isLoading: notificationsLoading } = trpc.notifications.list.useQuery()
  const { data: invoices, isLoading: invoicesLoading } = trpc.invoices.list.useQuery()
  const { data: profile } = trpc.profiles.get.useQuery()

  const utils = trpc.useUtils()
  const checkOverdue = trpc.invoices.checkOverdue.useMutation({
    onSettled: () => {
      utils.invoices.list.invalidate()
    },
  })

  useEffect(() => {
    checkOverdue.mutate()
  }, [])

  const isLoading = statsLoading || dealsLoading || notificationsLoading || invoicesLoading

  const upcomingDeadlines = useMemo(() => {
    if (!deals) return []
    return deals
      .filter((deal) => deal.content_deadline)
      .sort((a, b) => new Date(a.content_deadline!).getTime() - new Date(b.content_deadline!).getTime())
      .slice(0, 5)
      .map((deal) => {
        const deadline = new Date(deal.content_deadline!)
        const now = new Date()
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const urgent = diffDays <= 2
        return {
          id: deal.id,
          title: deal.title,
          brand: deal.brands?.name || "Unknown",
          brandColor: "bg-slate-600",
          due: formatRelativeTime(deadline),
          urgent,
        }
      })
  }, [deals])

  const recentActivity = useMemo(() => {
    if (!notifications) return []
    return notifications.slice(0, 5).map((notification) => {
      let type: "success" | "info" | "new" = "info"
      if (notification.type === "payment") type = "success"
      else if (notification.type === "deal_update") type = "new"
      return {
        id: notification.id,
        text: notification.title,
        type,
        brand: "System",
        brandColor: notification.type === "payment"
          ? "bg-emerald-600"
          : notification.type === "deal_update"
            ? "bg-amber-500"
            : "bg-blue-600",
      }
    })
  }, [notifications])

  const revenueData = useMemo(() => {
    if (!deals) return []
    const monthMap = new Map<string, number>()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    deals.forEach((deal) => {
      if (deal.amount && deal.stage === "paid") {
        const date = new Date(deal.created_at || Date.now())
        const key = monthNames[date.getMonth()]
        monthMap.set(key, (monthMap.get(key) || 0) + deal.amount)
      }
    })

    return Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
  }, [deals])

  const dealStageData = useMemo(() => {
    if (!deals) return []
    const stageMap = new Map<string, number>()
    deals.forEach((deal) => {
      const stage = deal.stage || "unknown"
      stageMap.set(stage, (stageMap.get(stage) || 0) + 1)
    })
    return Array.from(stageMap.entries()).map(([stage, count]) => ({ stage, count }))
  }, [deals])

  const exportRevenueCSV = () => {
    if (!revenueData.length) {
      toast.error("No data to export")
      return
    }
    const headers = ["Month", "Revenue"]
    const rows = revenueData.map((r) => [r.month, r.amount])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const dealsThisWeek = useMemo(() => {
    if (!deals) return { thisWeek: 0, lastWeek: 0 }
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
    const thisWeek = deals.filter((d) => {
      const created = new Date(d.created_at || 0)
      return created >= startOfWeek
    }).length
    const lastWeek = deals.filter((d) => {
      const created = new Date(d.created_at || 0)
      return created >= startOfLastWeek && created < startOfWeek
    }).length
    return { thisWeek, lastWeek }
  }, [deals])

  const revenueThisMonth = useMemo(() => {
    if (!deals) return { thisMonth: 0, lastMonth: 0 }
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = deals
      .filter((d) => d.stage === "paid" && new Date(d.created_at || 0) >= startOfMonth)
      .reduce((sum, d) => sum + (d.amount || 0), 0)
    const lastMonth = deals
      .filter((d) => {
        const created = new Date(d.created_at || 0)
        return d.stage === "paid" && created >= startOfLastMonth && created < startOfMonth
      })
      .reduce((sum, d) => sum + (d.amount || 0), 0)
    return { thisMonth, lastMonth }
  }, [deals])

  const overdueInvoiceCount = useMemo(() => {
    if (!invoices) return 0
    return invoices.filter((inv) => inv.status === "overdue").length
  }, [invoices])

  const activeDealsChange = useMemo(() => {
    const diff = dealsThisWeek.thisWeek - dealsThisWeek.lastWeek
    if (dealsThisWeek.lastWeek === 0) return `+${dealsThisWeek.thisWeek}`
    const pct = Math.round((diff / dealsThisWeek.lastWeek) * 100)
    return diff >= 0 ? `+${pct}%` : `${pct}%`
  }, [dealsThisWeek])

  const revenueChange = useMemo(() => {
    if (revenueThisMonth.lastMonth === 0) return revenueThisMonth.thisMonth > 0 ? "New" : "0%"
    const pct = Math.round(((revenueThisMonth.thisMonth - revenueThisMonth.lastMonth) / revenueThisMonth.lastMonth) * 100)
    return pct >= 0 ? `+${pct}%` : `${pct}%`
  }, [revenueThisMonth])

  const statCards = [
    {
      title: t("home.activeDeals"),
      value: stats?.activeDeals ?? 0,
      change: activeDealsChange,
      changeLabel: t("home.thisWeek"),
      trend: "up" as const,
      trendValue: dealsThisWeek.thisWeek,
      icon: Handshake,
      color: "#0d9488",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: t("home.revenueMtd"),
      value: stats?.totalRevenue ?? 0,
      change: revenueChange,
      changeLabel: t("home.vsLastMonth"),
      trend: "up" as const,
      trendValue: revenueThisMonth.thisMonth,
      icon: DollarSign,
      color: "#0d9488",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: t("home.pendingPayments"),
      value: stats?.pendingAmount ?? 0,
      change: String(overdueInvoiceCount),
      changeLabel: t("home.overdue"),
      trend: "warning" as const,
      trendValue: overdueInvoiceCount,
      icon: Clock,
      color: "#0d9488",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: t("home.totalDeals"),
      value: stats?.totalDeals ?? 0,
      change: t("home.ytd"),
      changeLabel: t("home.allTime"),
      trend: "up" as const,
      trendValue: 0,
      icon: TrendingUp,
      color: "#0d9488",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ]

  const displayName = profile?.full_name?.split(" ")[0] || "there"

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t("home.welcome", { name: displayName })}</h1>
            <p className="mt-0.5 text-sm opacity-80">{t("home.subtitle")}</p>
          </div>
          <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white h-8" onClick={() => toast.info(t("home.quickSetup"))}>
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            {t("home.quickSetup")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="absolute top-0 left-0 h-full w-1" style={{ backgroundColor: stat.color }} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} rounded-lg p-2`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-bold tracking-tight">
                {stat.title === "Revenue MTD" || stat.title === "Pending Payments"
                  ? formatCurrency(stat.value)
                  : stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {stat.trend === "up" && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                )}
                {stat.trend === "warning" && (
                  <div className="flex items-center gap-1 text-rose-600">
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <DealStatusChart data={dealStageData} />
      </div>

      <PaymentTrendChart invoices={invoices} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card className="shadow-card overflow-hidden border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-teal-600" />
              {t("home.upcomingDeadlines")}
            </CardTitle>
            <Link href="/deals">
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8">
                {t("home.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">{t("home.noUpcomingDeadlines")}</p>
              )}
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`group flex items-center justify-between rounded-lg p-3 transition-all duration-150 ${
                    deadline.urgent
                      ? "bg-rose-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${deadline.brandColor} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>
                      {deadline.brand.charAt(0)}
                    </div>
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      deadline.urgent ? "bg-rose-500 animate-pulse-subtle" : "bg-slate-300"
                    }`} />
                    <div>
                      <p className="font-medium text-sm group-hover:text-teal-700 transition-colors">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.brand}</p>
                    </div>
                  </div>
                  <Badge
                    variant={deadline.urgent ? "destructive" : "secondary"}
                    className={`badge-pill text-xs ${deadline.urgent ? "" : "bg-slate-100 text-slate-600"}`}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {deadline.due}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card overflow-hidden border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-500" />
              {t("home.recentActivity")}
            </CardTitle>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8">
                {t("home.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">{t("home.noRecentActivity")}</p>
              )}
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-center gap-3 rounded-lg p-3 transition-all duration-150 hover:bg-slate-50"
                >
                  <div className={`h-8 w-8 rounded-full ${activity.brandColor} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>
                    {activity.brand.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-teal-700 transition-colors">{activity.text}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`badge-pill text-xs ${
                      activity.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : activity.type === "new"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {activity.type === "success" ? "Paid" : activity.type === "new" ? "New" : "Sent"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card overflow-hidden border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-violet-500" />
            {t("home.quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Link href="/deals">
              <Button className="w-full h-9 bg-teal-600 hover:bg-teal-700 shadow-sm transition-all" variant="default">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("home.newDeal")}
              </Button>
            </Link>
            <Link href="/invoices">
              <Button className="w-full h-9 bg-amber-600 hover:bg-amber-700 shadow-sm transition-all text-white" variant="default">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("home.createInvoice")}
              </Button>
            </Link>
            <Link href="/brands">
              <Button className="w-full h-9 bg-violet-600 hover:bg-violet-700 shadow-sm transition-all text-white" variant="default">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("home.addBrand")}
              </Button>
            </Link>
            <Button className="w-full h-9 bg-slate-600 hover:bg-slate-700 shadow-sm transition-all text-white" variant="default" onClick={exportRevenueCSV}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> {t("home.exportCsv")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
