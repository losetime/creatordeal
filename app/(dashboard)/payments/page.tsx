"use client"

import { useState, useMemo, useEffect } from "react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  DollarSign, Clock, AlertTriangle, CheckCircle,
  Send, TrendingUp, Download, Wallet, Sparkles, ArrowUpRight, Search, X
} from "lucide-react"

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock; gradient: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700", icon: Clock, gradient: "from-slate-400 to-slate-500" },
  sent: { label: "Awaiting Payment", color: "bg-blue-100 text-blue-700", icon: Clock, gradient: "from-blue-500 to-blue-600" },
  viewed: { label: "Viewed", color: "bg-amber-100 text-amber-700", icon: Clock, gradient: "from-amber-500 to-orange-500" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" },
  overdue: { label: "Overdue", color: "bg-rose-100 text-rose-700", icon: AlertTriangle, gradient: "from-rose-500 to-pink-500" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500", icon: Clock, gradient: "from-slate-400 to-slate-500" },
}

function PaymentSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1.5 text-right">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <Card className="relative overflow-hidden shadow-card border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PaymentsPage() {
  const { t } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingMarkPaid, setPendingMarkPaid] = useState<string | null>(null)

  const { data: invoices, isLoading } = trpc.invoices.list.useQuery()
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.list.useQuery()
  const utils = trpc.useUtils()

  const checkOverdue = trpc.invoices.checkOverdue.useMutation({
    onSettled: () => {
      utils.invoices.list.invalidate()
    },
  })

  useEffect(() => {
    checkOverdue.mutate()
  }, [])

  const createPayment = trpc.payments.create.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate()
      utils.payments.list.invalidate()
      toast.success("Payment recorded", { description: "The payment has been recorded." })
    },
    onError: (err) => {
      toast.error("Failed to record payment", { description: err.message })
    },
  })

  const filteredInvoices = useMemo(() => {
    if (!invoices) return []
    return invoices.filter((inv) => {
      const title = inv.deals?.title ?? ""
      const brandName = inv.deals?.brands?.name ?? ""
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !inv.invoice_number?.toLowerCase().includes(q) &&
          !title.toLowerCase().includes(q) &&
          !brandName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (statusFilter && inv.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [invoices, searchQuery, statusFilter])

  const hasFilters = searchQuery || statusFilter

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("")
  }

  const totalPending = useMemo(() => {
    if (!invoices) return 0
    return invoices
      .filter((inv) => !["paid", "cancelled"].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)
  }, [invoices])

  const totalPaid = useMemo(() => {
    if (!invoices) return 0
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)
  }, [invoices])

  const totalOverdue = useMemo(() => {
    if (!invoices) return 0
    return invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)
  }, [invoices])

  const overdueCount = useMemo(() => {
    if (!invoices) return 0
    return invoices.filter((inv) => inv.status === "overdue").length
  }, [invoices])

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

  const sendFollowUp = async (id: string) => {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reminder",
          to: "", // Will need brand email from invoice data
          data: {
            title: "Payment Reminder",
            message: "This is a friendly reminder that your invoice is past due. Please process payment at your earliest convenience.",
          },
        }),
      })
      toast.success("Follow-up sent", { description: "Email reminder sent to the brand." })
    } catch {
      toast.error("Failed to send follow-up")
    }
  }

  const confirmMarkAsPaid = (id: string) => {
    setPendingMarkPaid(id)
    setConfirmDialogOpen(true)
  }

  const executeMarkPaid = () => {
    if (!pendingMarkPaid) return
    const invoice = invoices?.find((inv) => inv.id === pendingMarkPaid)
    if (invoice) {
      createPayment.mutate({
        invoice_id: pendingMarkPaid,
        amount: invoice.amount ?? 0,
        payment_method: "Manual",
      })
    }
    setConfirmDialogOpen(false)
    setPendingMarkPaid(null)
  }

  const exportCSV = () => {
    if (!invoices) return
    const headers = ["Invoice", "Deal", "Brand", "Amount", "Status", "Due Date", "Paid Date"]
    const rows = invoices.map((inv) => [
      inv.invoice_number ?? "",
      inv.deals?.title ?? "",
      inv.deals?.brands?.name ?? "",
      inv.amount ?? 0,
      inv.status,
      inv.due_date ?? "",
      inv.paid_at ?? "",
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/15 p-1.5">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("payments.title")}</h2>
              <p className="text-xs text-emerald-100">{t("payments.subtitle")}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={exportCSV} className="bg-white/15 hover:bg-white/25 text-white border-0 h-8" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden shadow-card border-0">
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden shadow-card border-0">
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden shadow-card border-0">
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-rose-500 to-pink-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-rose-50">
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue ({overdueCount})</p>
                    <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalOverdue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden shadow-card border-0">
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-violet-500 to-purple-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50">
                    <TrendingUp className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPaid + totalPending)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search & Filter */}
      <Card className="shadow-card border-0">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 bg-slate-50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs h-8"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Awaiting</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-rose-600">
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
            {hasFilters && !isLoading && (
              <span className="text-xs text-muted-foreground">
                {filteredInvoices.length} of {invoices?.length ?? 0} payments
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card className="shadow-card overflow-hidden border-0">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {isLoading ? (
              <>
                <PaymentSkeleton />
                <PaymentSkeleton />
                <PaymentSkeleton />
                <PaymentSkeleton />
                <PaymentSkeleton />
              </>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No payments found.
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig] ?? statusConfig.draft
                const StatusIcon = status.icon
                const daysOverdue = invoice.status === "overdue" && invoice.due_date ? getDaysOverdue(invoice.due_date) : 0
                const dealTitle = invoice.deals?.title ?? "Untitled Deal"
                const brandName = invoice.deals?.brands?.name ?? "Unknown Brand"

                return (
                  <div
                    key={invoice.id}
                    className={`group flex items-center justify-between rounded-lg p-3 border transition-all duration-150 ${
                      invoice.status === "overdue"
                        ? "border-rose-200 bg-rose-50 animate-pulse-ring"
                        : "border-slate-100 hover:border-teal-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        invoice.status === "paid"
                          ? "bg-emerald-50"
                          : invoice.status === "overdue"
                            ? "bg-rose-100"
                            : "bg-blue-50"
                      }`}>
                        <DollarSign className={`h-4 w-4 ${
                          invoice.status === "paid"
                            ? "text-emerald-600"
                            : invoice.status === "overdue"
                              ? "text-rose-600"
                              : "text-blue-600"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {dealTitle} • {brandName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-sm">{formatCurrency(invoice.amount ?? 0)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {invoice.due_date ? formatDate(invoice.due_date) : "—"}
                          {invoice.paid_at && (
                            <span className="text-emerald-600 font-medium">
                              {" "}• Paid {formatDate(invoice.paid_at)}
                            </span>
                          )}
                        </p>
                        {daysOverdue > 0 && (
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                            {daysOverdue} days overdue
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`badge-pill text-xs ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <div className="flex gap-1">
                        {invoice.status === "overdue" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendFollowUp(invoice.id)}
                            className="h-7 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 px-2"
                          >
                            <Send className="mr-1 h-3 w-3" /> Follow Up
                          </Button>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <Button
                            size="sm"
                            onClick={() => confirmMarkAsPaid(invoice.id)}
                            disabled={createPayment.isPending}
                            className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Mark Paid Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid?</DialogTitle>
            <DialogDescription>
              This will record the payment as received. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={executeMarkPaid}
              disabled={createPayment.isPending}
            >
              {createPayment.isPending ? "Confirming..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
