"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, FileText, Send, CheckCircle, Clock, AlertCircle, Download, Eye, Receipt, Sparkles, Trash2, Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"

const statusConfig = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600", icon: FileText, gradient: "from-slate-400 to-slate-500" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Send, gradient: "from-blue-500 to-blue-600" },
  viewed: { label: "Viewed", color: "bg-amber-100 text-amber-700", icon: Clock, gradient: "from-amber-500 to-orange-500" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" },
  overdue: { label: "Overdue", color: "bg-rose-100 text-rose-700", icon: AlertCircle, gradient: "from-rose-500 to-pink-500" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500", icon: FileText, gradient: "from-slate-400 to-slate-500" },
}

type Invoice = {
  id: string
  invoice_number: string
  amount: number
  currency: string
  status: string
  due_date: string
  created_at: string
  notes: string | null
  pdf_url: string | null
  deals: { title: string; brands: { name: string; contact_email: string | null } | null } | null
}

function InvoiceSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 border border-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-200" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-40 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1.5 text-right">
          <div className="h-3.5 w-16 bg-slate-200 rounded ml-auto" />
          <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
        </div>
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
        <div className="flex gap-1">
          <div className="h-7 w-7 bg-slate-100 rounded" />
          <div className="h-7 w-7 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  )
}

function InvoicePreview({ invoice, profile }: { invoice: Invoice; profile?: { full_name?: string | null; email?: string | null } | null }) {
  const brandName = invoice.deals?.brands?.name || "Brand"
  const dealTitle = invoice.deals?.title || "Sponsored Content"

  return (
    <div className="bg-white p-8 rounded-xl shadow-elevated max-w-md mx-auto border border-border">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">CreatorDeal</h1>
        </div>
        <p className="text-sm text-slate-500">Invoice</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">From</p>
          <p className="font-medium text-slate-800">{profile?.full_name || "Your Name"}</p>
          <p className="text-sm text-slate-500">{profile?.email || ""}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Bill To</p>
          <p className="font-medium text-slate-800">{brandName}</p>
          <p className="text-sm text-slate-500">{invoice.deals?.brands?.contact_email || ""}</p>
        </div>
      </div>

      <div className="border-t border-b border-border py-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-500">Invoice #</span>
          <span className="font-medium text-slate-800">{invoice.invoice_number}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-500">Deal</span>
          <span className="font-medium text-slate-800">{dealTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Due Date</span>
          <span className="font-medium text-slate-800">{formatDate(invoice.due_date)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Description</span>
          <span>Amount</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-700">{dealTitle}</span>
          <span className="font-medium text-slate-800">{formatCurrency(invoice.amount)}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-800">Total</span>
          <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{formatCurrency(invoice.amount)}</span>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Thank you for your business!</p>
        <p className="mt-1">Generated by CreatorDeal</p>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [selectedDealId, setSelectedDealId] = useState<string>("")
  const [newAmount, setNewAmount] = useState("")
  const [newCurrency, setNewCurrency] = useState("USD")
  const [newDueDate, setNewDueDate] = useState("")
  const [newNotes, setNewNotes] = useState("")

  const utils = trpc.useUtils()

  const { data: invoices, isLoading: invoicesLoading } = trpc.invoices.list.useQuery()
  const { data: profile } = trpc.profiles.get.useQuery()
  const { data: deals, isLoading: dealsLoading } = trpc.deals.list.useQuery()

  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate()
      toast.success("Invoice created")
      setIsDialogOpen(false)
      setSelectedDealId("")
      setNewAmount("")
      setNewDueDate("")
      setNewNotes("")
    },
    onError: (err) => {
      toast.error("Failed to create invoice", { description: err.message })
    },
  })

  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate()
      toast.success("Invoice deleted")
    },
    onError: (err) => {
      toast.error("Failed to delete invoice", { description: err.message })
    },
  })

  const invoiceList = invoices ?? []

  const totalPending = invoiceList
    .filter((inv) => !["paid", "cancelled"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalPaid = invoiceList
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0)

  const handleCreateInvoice = () => {
    if (!selectedDealId || !newAmount || !newDueDate) {
      toast.error("Please select a deal, enter an amount, and due date")
      return
    }
    createInvoice.mutate({
      deal_id: selectedDealId,
      amount: Number(newAmount),
      currency: newCurrency,
      due_date: newDueDate,
      notes: newNotes || undefined,
    })
  }

  const handleDelete = (id: string) => {
    deleteInvoice.mutate({ id })
  }

  const [sendingId, setSendingId] = useState<string | null>(null)

  const handleSend = async (id: string) => {
    setSendingId(id)
    try {
      const res = await fetch("/api/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Failed to send invoice", { description: data.error })
      } else {
        toast.success("Invoice sent!", { description: "PDF generated and email delivered." })
        utils.invoices.list.invalidate()
      }
    } catch {
      toast.error("Failed to send invoice")
    } finally {
      setSendingId(null)
    }
  }

  const downloadInvoice = async (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank")
      return
    }
    toast.info("Generating PDF...", { description: "Send the invoice first to generate a PDF." })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/15 p-1.5">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Invoices</h2>
              <p className="text-xs text-teal-100">{invoiceList.length} invoices total</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-teal-600 hover:bg-teal-50 shadow-sm h-8" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate an invoice for a completed deal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deal">Deal</Label>
                  <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                    <SelectTrigger>
                      <SelectValue placeholder={dealsLoading ? "Loading deals..." : "Select a deal"} />
                    </SelectTrigger>
                    <SelectContent>
                      {deals?.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title} — {deal.brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  onClick={handleCreateInvoice}
                  disabled={createInvoice.isPending}
                >
                  {createInvoice.isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden shadow-card border-0">
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-500 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
            <div className="rounded-lg bg-amber-50 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {invoiceList.filter((inv) => !["paid", "cancelled"].includes(inv.status)).length} invoices pending
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden shadow-card border-0">
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {invoiceList.filter((inv) => inv.status === "paid").length} invoices paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="shadow-card overflow-hidden border-0">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-amber-500" />
            All Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {invoicesLoading ? (
              <>
                <InvoiceSkeleton />
                <InvoiceSkeleton />
                <InvoiceSkeleton />
                <InvoiceSkeleton />
              </>
            ) : invoiceList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No invoices yet</p>
              </div>
            ) : (
              invoiceList.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig]
                const StatusIcon = status.icon
                return (
                  <div
                    key={invoice.id}
                    className="group flex items-center justify-between rounded-lg p-3 border border-border transition-all duration-150 hover:border-teal-100 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50">
                        <FileText className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-teal-700 transition-colors">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {invoice.deals?.title || "Deal"} • {invoice.deals?.brands?.name || "Brand"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-sm">{formatCurrency(invoice.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`badge-pill text-xs ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewInvoice(invoice)}
                          className="h-7 w-7 p-0 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-slate-100"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-rose-50"
                          onClick={() => handleDelete(invoice.id)}
                          disabled={deleteInvoice.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        </Button>
                        {invoice.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleSend(invoice.id)}
                            disabled={sendingId === invoice.id}
                            className="h-7 bg-teal-600 hover:bg-teal-700 text-white px-2"
                          >
                            {sendingId === invoice.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="mr-1 h-3 w-3" />
                            )} Send
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

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview how your invoice will look to the brand.
            </DialogDescription>
          </DialogHeader>
          {previewInvoice && <InvoicePreview invoice={previewInvoice} profile={profile} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
              Close
            </Button>
            {previewInvoice?.pdf_url ? (
              <Button
                onClick={() => window.open(previewInvoice.pdf_url!, "_blank")}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setPreviewInvoice(null)
                  toast.info("Send the invoice first to generate a PDF")
                }}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                <Download className="mr-2 h-4 w-4" /> Generate PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
