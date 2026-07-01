"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, Clock, AlertTriangle, CheckCircle, 
  Send, TrendingUp, Download 
} from "lucide-react"

const mockPayments = [
  {
    id: "1",
    deal: { title: "Nike Summer Campaign", brand: { name: "Nike" } },
    amount: 5000,
    status: "paid",
    due_date: "2026-06-15",
    paid_at: "2026-06-14",
    invoice_number: "INV-2026-001",
  },
  {
    id: "2",
    deal: { title: "Apple Product Review", brand: { name: "Apple" } },
    amount: 8000,
    status: "sent",
    due_date: "2026-07-01",
    paid_at: null,
    invoice_number: "INV-2026-002",
  },
  {
    id: "3",
    deal: { title: "Samsung Galaxy Launch", brand: { name: "Samsung" } },
    amount: 12000,
    status: "overdue",
    due_date: "2026-06-20",
    paid_at: null,
    invoice_number: "INV-2026-003",
  },
  {
    id: "4",
    deal: { title: "Tesla Model Y Review", brand: { name: "Tesla" } },
    amount: 15000,
    status: "draft",
    due_date: "2026-07-15",
    paid_at: null,
    invoice_number: "INV-2026-004",
  },
  {
    id: "5",
    deal: { title: "Netflix Series Promo", brand: { name: "Netflix" } },
    amount: 4000,
    status: "paid",
    due_date: "2026-06-10",
    paid_at: "2026-06-08",
    invoice_number: "INV-2026-005",
  },
]

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Awaiting Payment", color: "bg-blue-100 text-blue-700", icon: Clock },
  viewed: { label: "Viewed", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700", icon: Clock },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState(mockPayments)

  const totalPending = payments
    .filter((p) => !["paid", "cancelled"].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalOverdue = payments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0)

  const overdueCount = payments.filter((p) => p.status === "overdue").length

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const sendFollowUp = (paymentId: string) => {
    alert(`Follow-up email sent for payment ${paymentId}`)
  }

  const markAsPaid = (paymentId: string) => {
    setPayments(
      payments.map((p) =>
        p.id === paymentId
          ? { ...p, status: "paid", paid_at: new Date().toISOString().split("T")[0] }
          : p
      )
    )
  }

  const exportCSV = () => {
    const headers = ["Invoice", "Deal", "Brand", "Amount", "Status", "Due Date", "Paid Date"]
    const rows = payments.map((p) => [
      p.invoice_number,
      p.deal.title,
      p.deal.brand.name,
      p.amount,
      p.status,
      p.due_date,
      p.paid_at || "",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Tracking</h2>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">${totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-xl font-bold">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue ({overdueCount})</p>
                <p className="text-xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">${(totalPaid + totalPending).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => {
              const status = statusConfig[payment.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              const daysOverdue = payment.status === "overdue" ? getDaysOverdue(payment.due_date) : 0
              
              return (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    payment.status === "overdue" ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      payment.status === "paid" ? "bg-green-100" : 
                      payment.status === "overdue" ? "bg-red-100" : "bg-primary/10"
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        payment.status === "paid" ? "text-green-600" : 
                        payment.status === "overdue" ? "text-red-600" : "text-primary"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{payment.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.deal.title} • {payment.deal.brand.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-lg">${payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {new Date(payment.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {payment.paid_at && (
                          <span className="text-green-600">
                            {" "}• Paid {new Date(payment.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </p>
                      {daysOverdue > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          {daysOverdue} days overdue
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                    <div className="flex gap-2">
                      {payment.status === "overdue" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendFollowUp(payment.id)}
                        >
                          <Send className="mr-1 h-4 w-4" /> Follow Up
                        </Button>
                      )}
                      {payment.status !== "paid" && payment.status !== "cancelled" && (
                        <Button 
                          size="sm"
                          onClick={() => markAsPaid(payment.id)}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
