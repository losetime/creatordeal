"use client"

import { useState, useMemo } from "react"
import { trpc } from "@/lib/trpc/client"
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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Building2, Globe, Mail, User, TrendingUp, ExternalLink, Trash2, Pencil, FileText } from "lucide-react"

const BRAND_COLORS = [
  { bg: "#f97316", text: "bg-orange-50 text-orange-700" },
  { bg: "#2563eb", text: "bg-blue-50 text-blue-700" },
  { bg: "#e11d48", text: "bg-red-50 text-red-700" },
  { bg: "#16a34a", text: "bg-green-50 text-green-700" },
  { bg: "#7c3aed", text: "bg-purple-50 text-purple-700" },
  { bg: "#0ea5e9", text: "bg-sky-50 text-sky-700" },
  { bg: "#d97706", text: "bg-amber-50 text-amber-700" },
  { bg: "#ec4899", text: "bg-pink-50 text-pink-700" },
  { bg: "#475569", text: "bg-slate-50 text-slate-700" },
  { bg: "#0d9488", text: "bg-teal-50 text-teal-700" },
]

function getBrandColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % BRAND_COLORS.length
  return BRAND_COLORS[index]
}

export default function BrandsPage() {
  const utils = trpc.useUtils()

  const { data: brands, isLoading: brandsLoading } = trpc.brands.list.useQuery()
  const { data: deals, isLoading: dealsLoading } = trpc.deals.list.useQuery()

  const isLoading = brandsLoading || dealsLoading

  const brandStats = useMemo(() => {
    if (!brands || !deals) return []
    return brands.map((brand) => {
      const brandDeals = deals.filter((d) => d.brand_id === brand.id)
      const totalRevenue = brandDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)
      return { ...brand, dealCount: brandDeals.length, totalRevenue }
    })
  }, [brands, deals])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null)
  const [editingBrand, setEditingBrand] = useState<typeof brandStats[0] | null>(null)
  const [newBrand, setNewBrand] = useState({
    name: "",
    logo_url: "",
    website: "",
    contact_name: "",
    contact_email: "",
    notes: "",
  })
  const [editBrand, setEditBrand] = useState({
    name: "",
    logo_url: "",
    website: "",
    contact_name: "",
    contact_email: "",
    notes: "",
  })

  const createBrand = trpc.brands.create.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate()
      toast.success("Brand added")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const updateBrand = trpc.brands.update.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate()
      toast.success("Brand updated")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const deleteBrand = trpc.brands.delete.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate()
      toast.success("Brand deleted")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleAddBrand = () => {
    if (!newBrand.name) {
      toast.error("Brand name is required")
      return
    }
    createBrand.mutate({
      name: newBrand.name,
      logo_url: newBrand.logo_url || undefined,
      website: newBrand.website || undefined,
      contact_name: newBrand.contact_name || undefined,
      contact_email: newBrand.contact_email || undefined,
      notes: newBrand.notes || undefined,
    })
    setNewBrand({ name: "", logo_url: "", website: "", contact_name: "", contact_email: "", notes: "" })
    setIsDialogOpen(false)
  }

  const handleDeleteBrand = (brandId: string) => {
    setDeletingBrandId(brandId)
  }

  const confirmDeleteBrand = () => {
    if (deletingBrandId) {
      deleteBrand.mutate({ id: deletingBrandId })
      setDeletingBrandId(null)
    }
  }

  const handleEditBrand = (brand: typeof brandStats[0]) => {
    setEditingBrand(brand)
    setEditBrand({
      name: brand.name,
      logo_url: brand.logo_url ?? "",
      website: brand.website ?? "",
      contact_name: brand.contact_name ?? "",
      contact_email: brand.contact_email ?? "",
      notes: brand.notes ?? "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingBrand || !editBrand.name) return
    updateBrand.mutate({
      id: editingBrand.id,
      name: editBrand.name,
      logo_url: editBrand.logo_url || undefined,
      website: editBrand.website || undefined,
      contact_name: editBrand.contact_name || undefined,
      contact_email: editBrand.contact_email || undefined,
      notes: editBrand.notes || undefined,
    })
    setIsEditDialogOpen(false)
    setEditingBrand(null)
  }

  const formatUrl = (url: string | null | undefined) => {
    if (!url) return ""
    return url.replace("https://", "").replace("http://", "")
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-[88px] rounded-xl" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/15 p-1.5">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Brands</h2>
              <p className="text-xs text-teal-100">{brands?.length ?? 0} brands in your network</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-black/80 text-white h-8" size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Add a brand you&apos;re working with to your contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Brand Name *</Label>
                  <Input
                    id="name"
                    placeholder="Nike"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://nike.com"
                    value={newBrand.website}
                    onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input
                      id="contact_name"
                      placeholder="John Smith"
                      value={newBrand.contact_name}
                      onChange={(e) => setNewBrand({ ...newBrand, contact_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      placeholder="john@nike.com"
                      value={newBrand.contact_email}
                      onChange={(e) => setNewBrand({ ...newBrand, contact_email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes about this brand..."
                    value={newBrand.notes}
                    onChange={(e) => setNewBrand({ ...newBrand, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={handleAddBrand}
                  disabled={createBrand.isPending}
                >
                  {createBrand.isPending ? "Adding..." : "Add Brand"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-800">
        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-teal-600" />
        <p><strong>Pro tip:</strong> Upload a contract in Contracts — AI will automatically extract brand information and create this brand for you.</p>
      </div>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update the brand information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Brand Name *</Label>
              <Input
                id="edit-name"
                placeholder="Nike"
                value={editBrand.name}
                onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                placeholder="https://nike.com"
                value={editBrand.website}
                onChange={(e) => setEditBrand({ ...editBrand, website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contact_name">Contact Name</Label>
                <Input
                  id="edit-contact_name"
                  placeholder="John Smith"
                  value={editBrand.contact_name}
                  onChange={(e) => setEditBrand({ ...editBrand, contact_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_email">Contact Email</Label>
                <Input
                  id="edit-contact_email"
                  placeholder="john@nike.com"
                  value={editBrand.contact_email}
                  onChange={(e) => setEditBrand({ ...editBrand, contact_email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                placeholder="Any additional notes..."
                value={editBrand.notes}
                onChange={(e) => setEditBrand({ ...editBrand, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleSaveEdit}
              disabled={updateBrand.isPending}
            >
              {updateBrand.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingBrandId} onOpenChange={(open) => !open && setDeletingBrandId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              This will remove the brand association from all deals. Deals will still exist but show &quot;Unknown brand&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingBrandId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteBrand}
              disabled={deleteBrand.isPending}
            >
              {deleteBrand.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brands Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
        {brandStats.map((brand, index) => {
          const colors = getBrandColor(brand.name)
          return (
            <Card
              key={brand.id}
              className="group cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-150 hover-lift overflow-hidden animate-slide-up border-0"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="h-1" style={{ background: colors.bg }} />
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="h-10 w-10 rounded-lg object-cover shadow-sm transition-transform duration-150 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm transition-transform duration-150 group-hover:scale-105"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base group-hover:text-teal-700 transition-colors">{brand.name}</CardTitle>
                      <Badge variant="secondary" className={`badge-pill text-xs mt-1 ${colors.text.split(" ")[0]}`}>
                        {brand.dealCount} deals
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-teal-50"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-teal-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-rose-50"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </Button>
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 flex items-center justify-center hover:bg-slate-50 rounded"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pb-4 px-4">
                {brand.website && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-teal-600 truncate"
                    >
                      {formatUrl(brand.website)}
                    </a>
                  </div>
                )}
                {brand.contact_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {brand.contact_name}
                  </div>
                )}
                {brand.contact_email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {brand.contact_email}
                  </div>
                )}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-muted-foreground">Revenue</span>
                    </div>
                    <span className="text-sm font-bold text-teal-600">
                      ${brand.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {brandStats.length === 0 && (
        <Card className="py-16 shadow-card border-0">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-teal-100 p-6 mb-4">
              <Building2 className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold">No brands yet</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md">
              Add your first brand to start tracking your partnerships.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-black hover:bg-black/80 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
