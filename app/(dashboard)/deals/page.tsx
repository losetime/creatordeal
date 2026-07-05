"use client"

import { useState, useMemo } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus, GripVertical, DollarSign, Calendar,
  LayoutGrid, List, CalendarDays, Search, X, Trash2, Pencil,
  Handshake, Filter, Sparkles
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"

const stages = [
  { id: "inquiry", name: "Inquiry", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600", lightBg: "bg-blue-50" },
  { id: "negotiate", name: "Negotiate", color: "bg-amber-500", gradient: "from-amber-500 to-orange-500", lightBg: "bg-amber-50" },
  { id: "signed", name: "Signed", color: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500", lightBg: "bg-emerald-50" },
  { id: "creating", name: "Creating", color: "bg-violet-500", gradient: "from-violet-500 to-purple-500", lightBg: "bg-violet-50" },
  { id: "review", name: "Review", color: "bg-orange-500", gradient: "from-orange-500 to-red-500", lightBg: "bg-orange-50" },
  { id: "published", name: "Published", color: "bg-cyan-500", gradient: "from-cyan-500 to-blue-500", lightBg: "bg-cyan-50" },
  { id: "paid", name: "Paid", color: "bg-teal-500", gradient: "from-teal-500 to-emerald-500", lightBg: "bg-teal-50" },
  { id: "closed", name: "Closed", color: "bg-slate-400", gradient: "from-slate-400 to-slate-500", lightBg: "bg-slate-50" },
]

const brandColorMap: Record<string, string> = {
  nike: "bg-orange-500",
  apple: "bg-slate-600",
  samsung: "bg-blue-600",
  netflix: "bg-red-600",
  tesla: "bg-rose-600",
  amazon: "bg-amber-500",
  google: "bg-green-500",
  meta: "bg-blue-500",
  spotify: "bg-green-600",
  adobe: "bg-red-500",
}

function getBrandColor(name: string) {
  return brandColorMap[name.toLowerCase()] || "bg-teal-500"
}

type ViewMode = "kanban" | "list" | "calendar"

type DealType = {
  id: string
  title: string
  amount: number | null
  stage: string
  content_deadline: string | null
  brand_id: string | null
  currency: string | null
  content_type: string | null
  payment_deadline: string | null
  payment_terms: string | null
  notes: string | null
  brand: { id: string; name: string; logo_url: string | null } | null
}

export default function DealsPage() {
  const { t } = useLocale()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [editingDeal, setEditingDeal] = useState<DealType | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)

  const [newDeal, setNewDeal] = useState({
    title: "",
    brand_id: "",
    amount: "",
    content_type: "",
    content_deadline: "",
    payment_deadline: "",
    payment_terms: "",
    notes: "",
  })

  const [editDeal, setEditDeal] = useState({
    title: "",
    brand_id: "",
    amount: "",
    content_type: "",
    content_deadline: "",
    payment_deadline: "",
    payment_terms: "",
    notes: "",
  })

  const utils = trpc.useUtils()

  const { data: deals = [], isLoading: dealsLoading } = trpc.deals.list.useQuery()
  const { data: brands = [], isLoading: brandsLoading } = trpc.brands.list.useQuery()

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate()
      toast.success("Deal created successfully")
    },
    onError: (error) => {
      toast.error("Failed to create deal", { description: error.message })
    },
  })

  const updateMutation = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate()
      toast.success("Deal updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update deal", { description: error.message })
    },
  })

  const updateStageMutation = trpc.deals.updateStage.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate()
    },
    onError: (error) => {
      toast.error("Failed to move deal", { description: error.message })
    },
  })

  const deleteMutation = trpc.deals.delete.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate()
      toast.success("Deal deleted")
    },
    onError: (error) => {
      toast.error("Failed to delete deal", { description: error.message })
    },
  })

  const filteredDeals = useMemo(() => {
    return deals.filter((deal: DealType) => {
      if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (brandFilter && deal.brand?.name !== brandFilter) {
        return false
      }
      if (minAmount && (deal.amount ?? 0) < Number(minAmount)) {
        return false
      }
      if (maxAmount && (deal.amount ?? 0) > Number(maxAmount)) {
        return false
      }
      if (dateFrom && deal.content_deadline && deal.content_deadline < dateFrom) {
        return false
      }
      if (dateTo && deal.content_deadline && deal.content_deadline > dateTo) {
        return false
      }
      return true
    })
  }, [deals, searchQuery, brandFilter, minAmount, maxAmount, dateFrom, dateTo])

  const hasFilters = searchQuery || brandFilter || minAmount || maxAmount || dateFrom || dateTo

  const clearFilters = () => {
    setSearchQuery("")
    setBrandFilter("")
    setMinAmount("")
    setMaxAmount("")
    setDateFrom("")
    setDateTo("")
  }

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    const deal = deals.find((d: DealType) => d.id === dealId)
    if (deal && deal.stage !== stageId) {
      updateStageMutation.mutate({ id: dealId, stage: stageId as any })
    }
  }

  const handleCreateDeal = () => {
    if (!newDeal.title) return

    createMutation.mutate({
      title: newDeal.title,
      brand_id: newDeal.brand_id || undefined,
      amount: newDeal.amount ? Number(newDeal.amount) : undefined,
      content_type: newDeal.content_type || undefined,
      content_deadline: newDeal.content_deadline || undefined,
      payment_deadline: newDeal.payment_deadline || undefined,
      payment_terms: newDeal.payment_terms || undefined,
      notes: newDeal.notes || undefined,
    })

    setNewDeal({
      title: "",
      brand_id: "",
      amount: "",
      content_type: "",
      content_deadline: "",
      payment_deadline: "",
      payment_terms: "",
      notes: "",
    })
    setIsDialogOpen(false)
  }

  const handleDeleteDeal = (dealId: string) => {
    setDeletingDealId(dealId)
  }

  const confirmDeleteDeal = () => {
    if (deletingDealId) {
      deleteMutation.mutate({ id: deletingDealId })
      setDeletingDealId(null)
    }
  }

  const handleEditDeal = (deal: DealType) => {
    setEditingDeal(deal)
    setEditDeal({
      title: deal.title,
      brand_id: deal.brand_id || "",
      amount: deal.amount != null ? String(deal.amount) : "",
      content_type: deal.content_type || "",
      content_deadline: deal.content_deadline || "",
      payment_deadline: deal.payment_deadline || "",
      payment_terms: deal.payment_terms || "",
      notes: deal.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingDeal) return

    updateMutation.mutate({
      id: editingDeal.id,
      title: editDeal.title,
      brand_id: editDeal.brand_id || undefined,
      amount: editDeal.amount ? Number(editDeal.amount) : undefined,
      content_type: editDeal.content_type || undefined,
      content_deadline: editDeal.content_deadline || undefined,
      payment_deadline: editDeal.payment_deadline || undefined,
      payment_terms: editDeal.payment_terms || undefined,
      notes: editDeal.notes || undefined,
    })

    setIsEditDialogOpen(false)
    setEditingDeal(null)
  }

  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getDealsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filteredDeals.filter((d: DealType) => d.content_deadline === dateStr)
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (dealsLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
          <div className="absolute inset-0 dot-pattern opacity-15" />
          <div className="relative flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-white/15" />
            <div>
              <Skeleton className="h-5 w-32 bg-white/15" />
              <Skeleton className="h-3 w-24 bg-white/15 mt-1" />
            </div>
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="min-w-[260px] flex-shrink-0">
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/15 p-1.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("deals.title")}</h2>
              <p className="text-xs text-teal-100">{deals.length} {t("deals.title").toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-white/15 p-0.5">
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={`rounded h-7 px-2 ${viewMode === "kanban" ? "bg-white text-teal-600" : "text-white hover:bg-white/20"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded h-7 px-2 ${viewMode === "list" ? "bg-white text-teal-600" : "text-white hover:bg-white/20"}`}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={`rounded h-7 px-2 ${viewMode === "calendar" ? "bg-white text-teal-600" : "text-white hover:bg-white/20"}`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t("deals.createDeal")}
              </Button>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                  <DialogDescription>
                    Add a new sponsorship deal to your pipeline.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Deal Title</Label>
                    <Input
                      id="title"
                      placeholder="Nike Summer Campaign"
                      value={newDeal.title}
                      onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={newDeal.brand_id}
                      onValueChange={(value) => setNewDeal({ ...newDeal, brand_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
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
                        value={newDeal.amount}
                        onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content_type">Content Type</Label>
                      <Input
                        id="content_type"
                        placeholder="Instagram Reel"
                        value={newDeal.content_type}
                        onChange={(e) => setNewDeal({ ...newDeal, content_type: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="content_deadline">Content Deadline</Label>
                      <Input
                        id="content_deadline"
                        type="date"
                        value={newDeal.content_deadline}
                        onChange={(e) => setNewDeal({ ...newDeal, content_deadline: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_deadline">Payment Deadline</Label>
                      <Input
                        id="payment_deadline"
                        type="date"
                        value={newDeal.payment_deadline}
                        onChange={(e) => setNewDeal({ ...newDeal, payment_deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Input
                      id="payment_terms"
                      placeholder="Net 30"
                      value={newDeal.payment_terms}
                      onChange={(e) => setNewDeal({ ...newDeal, payment_terms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Additional notes..."
                      value={newDeal.notes}
                      onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                    onClick={handleCreateDeal}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0 bg-white">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 bg-slate-50 focus:bg-white input-focus"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" />
                Filters:
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-8"
              >
                <option value="">All Brands</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-20 h-8 bg-slate-50 focus:bg-white input-focus text-xs"
                />
                <span className="text-muted-foreground text-xs">-</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-20 h-8 bg-slate-50 focus:bg-white input-focus text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-32 h-8 bg-slate-50 focus:bg-white input-focus text-xs"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-32 h-8 bg-slate-50 focus:bg-white input-focus text-xs"
                />
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 text-xs">
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              )}
            </div>
          </div>

          {hasFilters && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing <span className="font-medium text-teal-600">{filteredDeals.length}</span> of <span className="font-medium">{deals.length}</span> deals
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <>
          {filteredDeals.length === 0 ? (
            <Card className="py-16 shadow-card">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 p-6 mb-4">
                  <Handshake className="h-10 w-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold">No deals found</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                  {hasFilters
                    ? "Try adjusting your filters to see more deals."
                    : "Create your first deal to get started with your sponsorship pipeline."}
                </p>
                {!hasFilters && (
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Create Deal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageDeals = filteredDeals.filter((d: DealType) => d.stage === stage.id)
                const stageTotal = stageDeals.reduce((sum: number, d: DealType) => sum + (d.amount ?? 0), 0)
                return (
                  <div
                    key={stage.id}
                    className="min-w-[260px] flex-shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    <Card className="h-full border-0 shadow-card">
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${stage.gradient}`} />
                            <CardTitle className="text-sm font-semibold">
                              {stage.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`badge-pill text-xs ${stage.lightBg}`}
                            >
                              {stageDeals.length}
                            </Badge>
                            {stageTotal > 0 && (
                              <span className="text-xs font-medium text-slate-500">
                                {formatCurrency(stageTotal)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0 px-3 pb-3">
                        {stageDeals.length === 0 ? (
                          <div className="rounded-lg border border-slate-200/50 p-4 text-center bg-slate-50/30">
                            <p className="text-xs text-muted-foreground">No deals</p>
                          </div>
                        ) : (
                          stageDeals.map((deal: DealType) => (
                            <div
                              key={deal.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, deal.id)}
                              className="group cursor-grab rounded-lg bg-white p-3 shadow-sm border border-slate-100 transition-all duration-150 hover:shadow-card-hover hover:border-teal-100 active:cursor-grabbing active:shadow-drag active:scale-[1.02]"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`h-6 w-6 rounded-full ${deal.brand ? getBrandColor(deal.brand.name) : "bg-slate-400"} flex items-center justify-center text-white text-[10px] font-semibold shadow-sm`}>
                                    {deal.brand?.name?.charAt(0) || "B"}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate group-hover:text-teal-700 transition-colors">{deal.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {deal.brand?.name || "Unknown brand"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditDeal(deal)
                                    }}
                                    className="p-1 hover:bg-teal-50 rounded transition-colors"
                                  >
                                    <Pencil className="h-3 w-3 text-teal-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteDeal(deal.id)
                                    }}
                                    className="p-1 hover:bg-rose-50 rounded transition-colors"
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3 text-rose-600" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                {deal.amount != null && (
                                  <div className="flex items-center text-xs text-muted-foreground bg-slate-50 px-1.5 py-0.5 rounded">
                                    <DollarSign className="mr-0.5 h-3 w-3" />
                                    <span className="font-medium">{formatCurrency(deal.amount)}</span>
                                  </div>
                                )}
                                {deal.content_deadline && (
                                  <div className="flex items-center text-xs text-muted-foreground bg-slate-50 px-1.5 py-0.5 rounded">
                                    <Calendar className="mr-0.5 h-3 w-3" />
                                    {new Date(deal.content_deadline).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" }
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="shadow-card overflow-hidden border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-slate-50 to-transparent text-left text-sm font-medium text-muted-foreground">
                    <th className="p-4">Deal</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal: DealType) => {
                    const stage = stages.find((s) => s.id === deal.stage)
                    return (
                      <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-gradient-to-r hover:from-teal-50/50 to-transparent transition-colors">
                        <td className="p-4 font-medium">{deal.title}</td>
                        <td className="p-4 text-muted-foreground">{deal.brand?.name || "—"}</td>
                        <td className="p-4 font-medium">{deal.amount != null ? formatCurrency(deal.amount) : "—"}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className={`${stage?.lightBg} ${stage?.color.replace('bg-', 'text-').replace('-500', '-700')}`}>
                            <span className={`h-2 w-2 rounded-full ${stage?.color} mr-1.5`} />
                            {stage?.name}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {deal.content_deadline ? formatDate(deal.content_deadline) : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDeal(deal)}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="shadow-card overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={prevMonth} className="hover:bg-teal-50 hover:text-teal-700">
                ← Prev
              </Button>
              <CardTitle className="text-lg">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" onClick={nextMonth} className="hover:bg-teal-50 hover:text-teal-700">
                Next →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {dayNames.map((day) => (
                <div key={day} className="bg-gradient-to-b from-slate-100 to-slate-50 p-3 text-center text-sm font-semibold text-slate-600">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50/50 p-2 min-h-[80px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayDeals = getDealsForDate(day)
                const isToday =
                  day === currentDate.getDate() &&
                  currentMonth === currentDate.getMonth() &&
                  currentYear === currentDate.getFullYear()

                return (
                  <div
                    key={day}
                    className={`bg-white p-2 min-h-[80px] transition-colors hover:bg-teal-50/50 ${
                      isToday ? "bg-gradient-to-br from-teal-50 to-emerald-50 ring-2 ring-teal-500 ring-inset" : ""
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-teal-600 font-bold" : "text-slate-700"}`}>
                      {day}
                    </div>
                    {dayDeals.map((deal: DealType) => (
                      <div
                        key={deal.id}
                        className="text-xs rounded-md bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 px-1.5 py-1 mb-1 truncate font-medium"
                        title={deal.title}
                      >
                        {deal.brand?.name || deal.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the deal information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Deal Title</Label>
              <Input
                id="edit-title"
                placeholder="Nike Summer Campaign"
                value={editDeal.title}
                onChange={(e) => setEditDeal({ ...editDeal, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand</Label>
              <Select
                value={editDeal.brand_id}
                onValueChange={(value) => setEditDeal({ ...editDeal, brand_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  placeholder="5000"
                  value={editDeal.amount}
                  onChange={(e) => setEditDeal({ ...editDeal, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content_type">Content Type</Label>
                <Input
                  id="edit-content_type"
                  placeholder="Instagram Reel"
                  value={editDeal.content_type}
                  onChange={(e) => setEditDeal({ ...editDeal, content_type: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-content_deadline">Content Deadline</Label>
                <Input
                  id="edit-content_deadline"
                  type="date"
                  value={editDeal.content_deadline}
                  onChange={(e) => setEditDeal({ ...editDeal, content_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-payment_deadline">Payment Deadline</Label>
                <Input
                  id="edit-payment_deadline"
                  type="date"
                  value={editDeal.payment_deadline}
                  onChange={(e) => setEditDeal({ ...editDeal, payment_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment_terms">Payment Terms</Label>
              <Input
                id="edit-payment_terms"
                placeholder="Net 30"
                value={editDeal.payment_terms}
                onChange={(e) => setEditDeal({ ...editDeal, payment_terms: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                placeholder="Additional notes..."
                value={editDeal.notes}
                onChange={(e) => setEditDeal({ ...editDeal, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDealId} onOpenChange={(open) => !open && setDeletingDealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              This will permanently delete this deal and all associated invoices, contracts, and deliverables. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDealId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDeal}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
