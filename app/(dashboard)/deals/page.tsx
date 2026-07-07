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
  Plus, DollarSign, Calendar, Search, X, Trash2, Pencil,
  Handshake, Filter, Sparkles, ChevronRight, ChevronDown,
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"

const stages = [
  { id: "inquiry", name: "Inquiry", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600", lightBg: "bg-blue-50", textColor: "text-blue-700" },
  { id: "negotiate", name: "Negotiate", color: "bg-amber-500", gradient: "from-amber-500 to-orange-500", lightBg: "bg-amber-50", textColor: "text-amber-700" },
  { id: "signed", name: "Signed", color: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500", lightBg: "bg-emerald-50", textColor: "text-emerald-700" },
  { id: "creating", name: "Creating", color: "bg-violet-500", gradient: "from-violet-500 to-purple-500", lightBg: "bg-violet-50", textColor: "text-violet-700" },
  { id: "review", name: "Review", color: "bg-orange-500", gradient: "from-orange-500 to-red-500", lightBg: "bg-orange-50", textColor: "text-orange-700" },
  { id: "published", name: "Published", color: "bg-cyan-500", gradient: "from-cyan-500 to-blue-500", lightBg: "bg-cyan-50", textColor: "text-cyan-700" },
  { id: "paid", name: "Paid", color: "bg-teal-500", gradient: "from-teal-500 to-emerald-500", lightBg: "bg-teal-50", textColor: "text-teal-700" },
  { id: "closed", name: "Closed", color: "bg-slate-400", gradient: "from-slate-400 to-slate-500", lightBg: "bg-slate-50", textColor: "text-slate-600" },
]

const brandColorMap: Record<string, string> = {
  nike: "bg-orange-500", apple: "bg-slate-600", samsung: "bg-blue-600",
  netflix: "bg-red-600", tesla: "bg-rose-600", amazon: "bg-amber-500",
  google: "bg-green-500", meta: "bg-blue-500", spotify: "bg-green-600",
}

function getBrandColor(name: string) {
  return brandColorMap[name.toLowerCase()] || "bg-teal-500"
}

function getDealBrand(deal: DealType) {
  return deal.brand || deal.brands
}

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
  brands: { id: string; name: string; logo_url: string | null } | null
}

export default function DealsPage() {
  const { t } = useLocale()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [editingDeal, setEditingDeal] = useState<DealType | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(["signed", "creating", "review"]))

  const [newDeal, setNewDeal] = useState({
    title: "", brand_id: "", amount: "", content_type: "",
    content_deadline: "", payment_deadline: "", payment_terms: "", notes: "",
  })

  const [editDeal, setEditDeal] = useState({
    title: "", brand_id: "", amount: "", content_type: "",
    content_deadline: "", payment_deadline: "", payment_terms: "", notes: "",
  })

  const utils = trpc.useUtils()
  const { data: deals = [], isLoading: dealsLoading } = trpc.deals.list.useQuery()
  const { data: brands = [] } = trpc.brands.list.useQuery()

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal created successfully") },
    onError: (error) => toast.error("Failed to create deal", { description: error.message }),
  })

  const updateMutation = trpc.deals.update.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal updated successfully") },
    onError: (error) => toast.error("Failed to update deal", { description: error.message }),
  })

  const updateStageMutation = trpc.deals.updateStage.useMutation({
    onSuccess: () => utils.deals.list.invalidate(),
    onError: (error) => toast.error("Failed to move deal", { description: error.message }),
  })

  const deleteMutation = trpc.deals.delete.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal deleted") },
    onError: (error) => toast.error("Failed to delete deal", { description: error.message }),
  })

  const filteredDeals = useMemo(() => {
    return deals.filter((deal: DealType) => {
      if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      const brand = getDealBrand(deal)
      if (brandFilter && brand?.name !== brandFilter) return false
      return true
    })
  }, [deals, searchQuery, brandFilter])

  const hasFilters = searchQuery || brandFilter

  const clearFilters = () => { setSearchQuery(""); setBrandFilter("") }

  const toggleStage = (stageId: string) => {
    const next = new Set(expandedStages)
    if (next.has(stageId)) next.delete(stageId)
    else next.add(stageId)
    setExpandedStages(next)
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
    setNewDeal({ title: "", brand_id: "", amount: "", content_type: "", content_deadline: "", payment_deadline: "", payment_terms: "", notes: "" })
    setIsDialogOpen(false)
  }

  const handleEditDeal = (deal: DealType) => {
    setEditingDeal(deal)
    setEditDeal({
      title: deal.title, brand_id: deal.brand_id || "",
      amount: deal.amount != null ? String(deal.amount) : "",
      content_type: deal.content_type || "", content_deadline: deal.content_deadline || "",
      payment_deadline: deal.payment_deadline || "", payment_terms: deal.payment_terms || "",
      notes: deal.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingDeal) return
    updateMutation.mutate({
      id: editingDeal.id, title: editDeal.title,
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

  const moveToNextStage = (deal: DealType) => {
    const currentIdx = stages.findIndex((s) => s.id === deal.stage)
    if (currentIdx < stages.length - 1) {
      updateStageMutation.mutate({ id: deal.id, stage: stages[currentIdx + 1].id as any })
    }
  }

  if (dealsLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-16 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-1.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("deals.title")}</h2>
              <p className="text-xs opacity-80">{deals.length} {t("deals.title").toLowerCase()}</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-black/80 text-white h-8" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t("deals.createDeal")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>Add a new sponsorship deal to your pipeline.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Deal Title</Label>
                  <Input placeholder="Nike Summer Campaign" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={newDeal.brand_id} onValueChange={(v) => setNewDeal({ ...newDeal, brand_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="5000" value={newDeal.amount} onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Input placeholder="Instagram Reel" value={newDeal.content_type} onChange={(e) => setNewDeal({ ...newDeal, content_type: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Content Deadline</Label>
                    <Input type="date" value={newDeal.content_deadline} onChange={(e) => setNewDeal({ ...newDeal, content_deadline: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Deadline</Label>
                    <Input type="date" value={newDeal.payment_deadline} onChange={(e) => setNewDeal({ ...newDeal, payment_deadline: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input placeholder="Net 30" value={newDeal.payment_terms} onChange={(e) => setNewDeal({ ...newDeal, payment_terms: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input placeholder="Additional notes..." value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-black hover:bg-black/80 text-white" onClick={handleCreateDeal} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Deal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0 bg-white">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search deals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 bg-slate-50" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs h-8">
                <option value="">All Brands</option>
                {brands.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-rose-600 hover:bg-rose-50 h-8 px-2 text-xs">
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vertical Pipeline */}
      <div className="space-y-3">
        {stages.map((stage, stageIdx) => {
          const stageDeals = filteredDeals.filter((d: DealType) => d.stage === stage.id)
          const isExpanded = expandedStages.has(stage.id)
          const stageTotal = stageDeals.reduce((sum: number, d: DealType) => sum + (d.amount ?? 0), 0)

          return (
            <div key={stage.id}>
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all"
              >
                <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${stage.gradient} flex-shrink-0`} />
                <span className="font-semibold text-sm text-slate-700">{stage.name}</span>
                <Badge variant="secondary" className={`${stage.lightBg} ${stage.textColor} text-xs`}>
                  {stageDeals.length}
                </Badge>
                {stageTotal > 0 && (
                  <span className="text-xs text-slate-500 ml-auto">{formatCurrency(stageTotal)}</span>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Stage Deals */}
              {isExpanded && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 border-slate-100 pl-4">
                  {stageDeals.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3">No deals in this stage</p>
                  ) : (
                    stageDeals.map((deal: DealType) => {
                      const brand = getDealBrand(deal)
                      return (
                        <div key={deal.id} className="group bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:shadow-card hover:border-teal-100 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-full ${brand ? getBrandColor(brand.name) : "bg-slate-400"} flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0`}>
                                {brand?.name?.charAt(0) || "B"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-slate-800">{deal.title}</p>
                                <p className="text-xs text-muted-foreground">{brand?.name || "Unknown brand"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {stageIdx < stages.length - 1 && deal.stage !== "closed" && (
                                <Button variant="ghost" size="sm" onClick={() => moveToNextStage(deal)} className="h-7 px-2 text-xs text-teal-600 hover:bg-teal-50">
                                  <ChevronRight className="h-3 w-3 mr-0.5" /> Next
                                </Button>
                              )}
                              <button onClick={() => handleEditDeal(deal)} className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                              </button>
                              <button onClick={() => setDeletingDealId(deal.id)} className="p-1.5 hover:bg-rose-50 rounded transition-colors">
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 ml-10">
                            {deal.amount != null && (
                              <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                <DollarSign className="h-3 w-3 mr-0.5" />
                                {formatCurrency(deal.amount)}
                              </div>
                            )}
                            {deal.content_deadline && (
                              <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                <Calendar className="h-3 w-3 mr-0.5" />
                                {new Date(deal.content_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            )}
                            {deal.content_type && (
                              <span className="text-xs text-slate-400">{deal.content_type}</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Connector line between stages */}
              {stageIdx < stages.length - 1 && isExpanded && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-3 bg-slate-200 rounded-full" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <Card className="py-16 shadow-card">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 p-6 mb-4">
              <Handshake className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold">No deals found</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md">
              {hasFilters ? "Try adjusting your filters." : "Upload a contract or create a deal to get started."}
            </p>
            {!hasFilters && (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-black hover:bg-black/80 text-white shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Create Deal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>Update the deal information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Deal Title</Label>
              <Input value={editDeal.title} onChange={(e) => setEditDeal({ ...editDeal, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={editDeal.brand_id} onValueChange={(v) => setEditDeal({ ...editDeal, brand_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" value={editDeal.amount} onChange={(e) => setEditDeal({ ...editDeal, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Input value={editDeal.content_type} onChange={(e) => setEditDeal({ ...editDeal, content_type: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Deadline</Label>
                <Input type="date" value={editDeal.content_deadline} onChange={(e) => setEditDeal({ ...editDeal, content_deadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Deadline</Label>
                <Input type="date" value={editDeal.payment_deadline} onChange={(e) => setEditDeal({ ...editDeal, payment_deadline: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-black hover:bg-black/80 text-white" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingDealId} onOpenChange={(open) => !open && setDeletingDealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>This will permanently delete this deal and all associated data. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDealId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deletingDealId) { deleteMutation.mutate({ id: deletingDealId }); setDeletingDealId(null) } }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
