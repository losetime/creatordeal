"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Plus, GripVertical, DollarSign, Calendar, 
  LayoutGrid, List, CalendarDays, Search, X, Trash2, Pencil 
} from "lucide-react"

const stages = [
  { id: "inquiry", name: "Inquiry", color: "bg-blue-500" },
  { id: "negotiate", name: "Negotiate", color: "bg-yellow-500" },
  { id: "signed", name: "Signed", color: "bg-green-500" },
  { id: "creating", name: "Creating", color: "bg-purple-500" },
  { id: "review", name: "Review", color: "bg-orange-500" },
  { id: "published", name: "Published", color: "bg-cyan-500" },
  { id: "paid", name: "Paid", color: "bg-emerald-500" },
  { id: "closed", name: "Closed", color: "bg-gray-500" },
]

const mockDeals = [
  {
    id: "1",
    title: "Nike Summer Campaign",
    brand: { name: "Nike" },
    amount: 5000,
    stage: "inquiry",
    content_deadline: "2026-07-15",
  },
  {
    id: "2",
    title: "Apple Product Review",
    brand: { name: "Apple" },
    amount: 8000,
    stage: "negotiate",
    content_deadline: "2026-07-20",
  },
  {
    id: "3",
    title: "Samsung Galaxy Launch",
    brand: { name: "Samsung" },
    amount: 12000,
    stage: "signed",
    content_deadline: "2026-08-01",
  },
  {
    id: "4",
    title: "Netflix Series Promo",
    brand: { name: "Netflix" },
    amount: 4000,
    stage: "creating",
    content_deadline: "2026-07-10",
  },
  {
    id: "5",
    title: "Tesla Model Y Review",
    brand: { name: "Tesla" },
    amount: 15000,
    stage: "published",
    content_deadline: "2026-06-25",
  },
]

type ViewMode = "kanban" | "list" | "calendar"

export default function DealsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deals, setDeals] = useState(mockDeals)
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [newDeal, setNewDeal] = useState({
    title: "",
    brand: "",
    amount: "",
    deadline: "",
  })
  const [editingDeal, setEditingDeal] = useState<typeof mockDeals[0] | null>(null)
  const [editDeal, setEditDeal] = useState({
    title: "",
    brand: "",
    amount: "",
    deadline: "",
  })

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const brands = useMemo(() => {
    const unique = new Set(deals.map((d) => d.brand?.name).filter(Boolean))
    return Array.from(unique)
  }, [deals])

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Search filter
      if (searchQuery && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Brand filter
      if (brandFilter && deal.brand?.name !== brandFilter) {
        return false
      }
      // Amount filter
      if (minAmount && deal.amount < Number(minAmount)) {
        return false
      }
      if (maxAmount && deal.amount > Number(maxAmount)) {
        return false
      }
      // Date filter
      if (dateFrom && deal.content_deadline < dateFrom) {
        return false
      }
      if (dateTo && deal.content_deadline > dateTo) {
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
    setDeals(
      deals.map((deal) =>
        deal.id === dealId ? { ...deal, stage: stageId } : deal
      )
    )
  }

  const handleCreateDeal = () => {
    if (!newDeal.title || !newDeal.brand) return
    
    const deal = {
      id: String(Date.now()),
      title: newDeal.title,
      brand: { name: newDeal.brand },
      amount: Number(newDeal.amount) || 0,
      stage: "inquiry",
      content_deadline: newDeal.deadline || new Date().toISOString().split("T")[0],
    }
    
    setDeals([deal, ...deals])
    setNewDeal({ title: "", brand: "", amount: "", deadline: "" })
    setIsDialogOpen(false)
  }

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter((d) => d.id !== dealId))
  }

  const handleEditDeal = (deal: typeof mockDeals[0]) => {
    setEditingDeal(deal)
    setEditDeal({
      title: deal.title,
      brand: deal.brand?.name || "",
      amount: String(deal.amount),
      deadline: deal.content_deadline,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingDeal) return
    
    setDeals(
      deals.map((d) =>
        d.id === editingDeal.id
          ? {
              ...d,
              title: editDeal.title,
              brand: { name: editDeal.brand },
              amount: Number(editDeal.amount) || 0,
              content_deadline: editDeal.deadline,
            }
          : d
      )
    )
    setIsEditDialogOpen(false)
    setEditingDeal(null)
  }

  // Calendar view helper
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth())
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
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
    return filteredDeals.filter((d) => d.content_deadline === dateStr)
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Deal Pipeline</h2>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-l-none"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Deal
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
                  <Input 
                    id="brand" 
                    placeholder="Nike"
                    value={newDeal.brand}
                    onChange={(e) => setNewDeal({ ...newDeal, brand: e.target.value })}
                  />
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
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input 
                      id="deadline" 
                      type="date"
                      value={newDeal.deadline}
                      onChange={(e) => setNewDeal({ ...newDeal, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDeal}>
                  Create Deal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min $"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max $"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36"
                />
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </div>

          {hasFilters && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {filteredDeals.length} of {deals.length} deals
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="min-w-[280px] flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-sm font-medium">
                      {stage.name}
                    </CardTitle>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {filteredDeals.filter((d) => d.stage === stage.id).length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredDeals
                    .filter((deal) => deal.stage === stage.id)
                    .map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className="group cursor-grab rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {deal.brand?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditDeal(deal)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDeal(deal.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <DollarSign className="mr-1 h-4 w-4" />
                            {deal.amount.toLocaleString()}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(deal.content_deadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="p-4">Deal</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => {
                    const stage = stages.find((s) => s.id === deal.stage)
                    return (
                      <tr key={deal.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4 font-medium">{deal.title}</td>
                        <td className="p-4 text-muted-foreground">{deal.brand?.name}</td>
                        <td className="p-4">${deal.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${stage?.color}`} />
                            {stage?.name}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(deal.content_deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDeal(deal.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={prevMonth}>
                ← Prev
              </Button>
              <CardTitle>
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" onClick={nextMonth}>
                Next →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border">
              {dayNames.map((day) => (
                <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-background p-2" />
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
                    className={`bg-background p-2 min-h-[80px] ${isToday ? "bg-primary/5" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary font-bold" : ""}`}>
                      {day}
                    </div>
                    {dayDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="text-xs rounded bg-primary/10 px-1 py-0.5 mb-1 truncate"
                        title={deal.title}
                      >
                        {deal.brand?.name}
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
              <Input 
                id="edit-brand" 
                placeholder="Nike"
                value={editDeal.brand}
                onChange={(e) => setEditDeal({ ...editDeal, brand: e.target.value })}
              />
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
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Input 
                  id="edit-deadline" 
                  type="date"
                  value={editDeal.deadline}
                  onChange={(e) => setEditDeal({ ...editDeal, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
