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
  Plus, DollarSign, Calendar, Trash2, Pencil,
  Handshake, Sparkles, ChevronRight, FileText,
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
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<DealType | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState("inquiry")

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
  const { data: profile } = trpc.profiles.get.useQuery()

  // Check if user can create more deals
  const canCreateDeal = () => {
    if (profile?.plan === "pro" || profile?.plan === "team") return true
    const activeDeals = deals.filter((d: DealType) => d.stage !== "closed")
    return activeDeals.length < 3
  }

  const handleCreateClick = () => {
    if (!canCreateDeal()) {
      setIsUpgradeDialogOpen(true)
      return
    }
    setIsDialogOpen(true)
  }

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal created successfully") },
    onError: (error) => {
      try {
        const parsed = JSON.parse(error.message)
        if (parsed.code === "DEAL_LIMIT_REACHED") {
          toast.error(parsed.message, {
            description: parsed.upgradeMessage,
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = parsed.upgradeUrl,
            },
            duration: 10000,
          })
        } else {
          toast.error("Failed to create deal", { description: error.message })
        }
      } catch {
        toast.error("Failed to create deal", { description: error.message })
      }
    },
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
    return deals
  }, [deals])

  const activeStageDeals = useMemo(() => {
    return filteredDeals.filter((d: DealType) => d.stage === activeStage)
  }, [filteredDeals, activeStage])

  const activeStageTotal = useMemo(() => {
    return activeStageDeals.reduce((sum: number, d: DealType) => sum + (d.amount ?? 0), 0)
  }, [activeStageDeals])

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

  const activeStageData = stages.find((s) => s.id === activeStage)

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
              <Button className="bg-black hover:bg-black/80 text-white h-8" size="sm" onClick={(e) => { e.preventDefault(); handleCreateClick() }}>
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

          {/* Upgrade Dialog */}
          <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upgrade to Creator Club</DialogTitle>
                <DialogDescription>
                  You&apos;ve reached the free plan limit of 3 active deals.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-teal-50 p-4">
                  <p className="text-sm text-teal-800">
                    Upgrade to <strong>Creator Club</strong> for unlimited deals, smart invoicing, AI contract scanner, rate benchmarking, and priority support.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">$9.90/month • Cancel anytime</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>Maybe Later</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => window.location.href = "/subscription"}>
                  Upgrade Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-800">
        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-teal-600" />
        <p><strong>Pro tip:</strong> Go to Contracts to upload a contract — AI will automatically extract key information and create a deal and brand for you.</p>
      </div>

      {/* Stage Flow Tabs - Chevron Style */}
      <div className="flex items-center overflow-x-auto pb-2">
        {stages.map((stage, idx) => {
          const stageDeals = filteredDeals.filter((d: DealType) => d.stage === stage.id)
          const isActive = activeStage === stage.id
          return (
            <div key={stage.id} className="relative">
              <button
                onClick={() => setActiveStage(stage.id)}
                className={`relative flex items-center gap-2 pl-5 pr-7 py-3 text-sm font-medium whitespace-nowrap transition-all z-10 ${
                  isActive
                    ? `${stage.color} text-white shadow-md`
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
                  border: isActive ? 'none' : '1px solid #e5e7eb',
                }}
              >
                <span>{stage.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stageDeals.length}
                </span>
              </button>
              {/* Border overlay for inactive tabs */}
              {!isActive && (
                <div
                  className="absolute inset-0 pointer-events-none border border-slate-200"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Active Stage Content */}
      <div className="space-y-3">
        {/* Stage Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${activeStageData?.gradient}`} />
            <h3 className="font-semibold text-slate-700">{activeStageData?.name}</h3>
            {activeStageTotal > 0 && (
              <span className="text-sm text-slate-500">{formatCurrency(activeStageTotal)}</span>
            )}
          </div>
        </div>

        {/* Deals Grid */}
        {activeStageDeals.length === 0 ? (
          <Card className="py-12 shadow-card">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-3">
                <Handshake className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-muted-foreground">No deals in this stage</p>
              <Button size="sm" onClick={handleCreateClick} className="mt-3 bg-black hover:bg-black/80 text-white">
                <Plus className="mr-1 h-3 w-3" /> Add Deal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeStageDeals.map((deal: DealType) => {
              const brand = getDealBrand(deal)
              const stageIdx = stages.findIndex((s) => s.id === deal.stage)
              return (
                <Card key={deal.id} className="group shadow-card hover:shadow-card-hover transition-all border-0 relative">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`h-8 w-8 rounded-full ${brand ? getBrandColor(brand.name) : "bg-slate-400"} flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0`}>
                        {brand?.name?.charAt(0) || "B"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-800 truncate">{deal.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{brand?.name || "Unknown brand"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                    {/* Action buttons - bottom right */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stageIdx < stages.length - 1 && deal.stage !== "closed" && (
                        <Button size="sm" onClick={() => moveToNextStage(deal)} className="h-6 px-2 text-xs bg-black hover:bg-black/80 text-white">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                      <button onClick={() => handleEditDeal(deal)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                      <button onClick={() => setDeletingDealId(deal.id)} className="p-1 hover:bg-rose-50 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
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
