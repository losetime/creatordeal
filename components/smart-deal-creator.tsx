"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"

interface ParsedData {
  brand_name: string | null
  brand_contact_name: string | null
  brand_contact_email: string | null
  brand_website: string | null
  deal_title: string | null
  amount: number | null
  currency: string | null
  content_type: string | null
  deliverables: Array<{
    type: string
    description: string
    quantity: number
  }> | null
  content_deadline: string | null
  payment_deadline: string | null
  payment_terms: string | null
  usage_rights: string | null
  key_terms: string[]
  risks: string[]
  summary: string
}

interface UploadResult {
  fileUrl: string
  fileName: string
  storagePath: string
  parsedData: ParsedData | null
}

export function SmartDealCreator({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [editedData, setEditedData] = useState<ParsedData | null>(null)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const utils = trpc.useUtils()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch("/api/contracts/smart-upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Upload failed")
        return
      }

      setUploadResult({
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        storagePath: data.storagePath,
        parsedData: data.parsedData,
      })

      if (data.parsedData) {
        setEditedData({ ...data.parsedData })
        toast.success("Contract analyzed successfully!")
      } else {
        setEditedData({
          brand_name: null,
          brand_contact_name: null,
          brand_contact_email: null,
          brand_website: null,
          deal_title: null,
          amount: null,
          currency: "USD",
          content_type: null,
          deliverables: null,
          content_deadline: null,
          payment_deadline: null,
          payment_terms: null,
          usage_rights: null,
          key_terms: [],
          risks: [],
          summary: "",
        })
        toast.warning(data.aiError || "AI parsing failed. Please fill in manually.")
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!editedData || !uploadResult) return

    setLoading(true)

    try {
      const res = await fetch("/api/contracts/confirm-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: editedData.brand_name,
          brand_contact_name: editedData.brand_contact_name,
          brand_contact_email: editedData.brand_contact_email,
          brand_website: editedData.brand_website,
          title: editedData.deal_title || `Deal with ${editedData.brand_name || "Unknown"}`,
          amount: editedData.amount,
          currency: editedData.currency,
          content_type: editedData.content_type,
          content_deadline: editedData.content_deadline,
          payment_deadline: editedData.payment_deadline,
          payment_terms: editedData.payment_terms,
          file_url: uploadResult.fileUrl,
          file_name: uploadResult.fileName,
          storage_path: uploadResult.storagePath,
          ai_summary: editedData.summary,
          key_terms: editedData.key_terms,
          risks: editedData.risks,
          usage_rights: editedData.usage_rights,
          deliverables: editedData.deliverables,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "DEAL_LIMIT_REACHED") {
          setIsUpgradeDialogOpen(true)
          return
        }
        throw new Error(data.error || "Failed to create deal")
      }

      utils.deals.list.invalidate()
      utils.contracts.list.invalidate()
      utils.brands.list.invalidate()

      toast.success("Deal created successfully!")
      onComplete?.()
    } catch (error) {
      toast.error("Failed to create deal")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setEditedData(null)
  }

  const addDeliverable = () => {
    if (!editedData) return
    setEditedData({
      ...editedData,
      deliverables: [
        ...(editedData.deliverables || []),
        { type: "", description: "", quantity: 1 },
      ],
    })
  }

  const removeDeliverable = (index: number) => {
    if (!editedData?.deliverables) return
    setEditedData({
      ...editedData,
      deliverables: editedData.deliverables.filter((_, i) => i !== index),
    })
  }

  const updateDeliverable = (index: number, field: string, value: any) => {
    if (!editedData?.deliverables) return
    const updated = [...editedData.deliverables]
    updated[index] = { ...updated[index], [field]: value }
    setEditedData({ ...editedData, deliverables: updated })
  }

  // Show review form if we have data
  if (editedData && uploadResult) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-teal-500" />
            Review Extracted Data
          </CardTitle>
          <CardDescription>
            Review and edit the information extracted from your contract.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {editedData.summary && (
            <div className="rounded-lg bg-teal-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">AI Summary</span>
              </div>
              <p className="text-sm text-teal-800">{editedData.summary}</p>
            </div>
          )}

          {editedData.risks && editedData.risks.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {editedData.risks.length} potential risk{editedData.risks.length > 1 ? "s" : ""} detected
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {editedData.risks.map((risk, i) => (
                  <li key={`risk-${i}`} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Brand Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand_name">Brand Name *</Label>
                <Input
                  id="brand_name"
                  value={editedData.brand_name || ""}
                  onChange={(e) => setEditedData({ ...editedData, brand_name: e.target.value })}
                  placeholder="Nike"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_contact">Contact Name</Label>
                <Input
                  id="brand_contact"
                  value={editedData.brand_contact_name || ""}
                  onChange={(e) => setEditedData({ ...editedData, brand_contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_email">Contact Email</Label>
                <Input
                  id="brand_email"
                  type="email"
                  value={editedData.brand_contact_email || ""}
                  onChange={(e) => setEditedData({ ...editedData, brand_contact_email: e.target.value })}
                  placeholder="john@brand.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_website">Website</Label>
                <Input
                  id="brand_website"
                  value={editedData.brand_website || ""}
                  onChange={(e) => setEditedData({ ...editedData, brand_website: e.target.value })}
                  placeholder="https://brand.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Deal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deal_title">Deal Title *</Label>
                <Input
                  id="deal_title"
                  value={editedData.deal_title || ""}
                  onChange={(e) => setEditedData({ ...editedData, deal_title: e.target.value })}
                  placeholder="Summer Campaign 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editedData.amount || ""}
                  onChange={(e) => setEditedData({ ...editedData, amount: e.target.value ? Number(e.target.value) : null })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={editedData.currency || "USD"}
                  onValueChange={(value) => setEditedData({ ...editedData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_type">Content Type</Label>
                <Input
                  id="content_type"
                  value={editedData.content_type || ""}
                  onChange={(e) => setEditedData({ ...editedData, content_type: e.target.value })}
                  placeholder="Instagram Reel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={editedData.payment_terms || ""}
                  onChange={(e) => setEditedData({ ...editedData, payment_terms: e.target.value })}
                  placeholder="Net 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_deadline">Content Deadline</Label>
                <Input
                  id="content_deadline"
                  type="date"
                  value={editedData.content_deadline || ""}
                  onChange={(e) => setEditedData({ ...editedData, content_deadline: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_deadline">Payment Deadline</Label>
                <Input
                  id="payment_deadline"
                  type="date"
                  value={editedData.payment_deadline || ""}
                  onChange={(e) => setEditedData({ ...editedData, payment_deadline: e.target.value || null })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Deliverables</h3>
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable} className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {editedData.deliverables && editedData.deliverables.length > 0 ? (
              <div className="space-y-3">
                {editedData.deliverables.map((d, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-slate-50">
                    <div className="flex-1 grid gap-3 md:grid-cols-3">
                      <Input placeholder="Type (e.g., Instagram Post)" value={d.type} onChange={(e) => updateDeliverable(i, "type", e.target.value)} />
                      <Input placeholder="Description" value={d.description} onChange={(e) => updateDeliverable(i, "description", e.target.value)} />
                      <Input type="number" placeholder="Qty" value={d.quantity} onChange={(e) => updateDeliverable(i, "quantity", Number(e.target.value) || 1)} className="w-20" />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDeliverable(i)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No deliverables extracted. Click "Add" to add one.</p>
            )}
          </div>

          {editedData.key_terms && editedData.key_terms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Key Terms</h3>
              <div className="flex flex-wrap gap-2">
                {editedData.key_terms.map((term, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-100">{term}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={reset} className="flex-1">Start Over</Button>
            <Button
              onClick={handleConfirm}
              disabled={!editedData.brand_name || !editedData.deal_title || loading}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Create Deal</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show upload form
  return (
    <>
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-500" />
          Upload Contract
        </CardTitle>
        <CardDescription>
          Upload a contract and AI will automatically extract key information to create your deal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-teal-300 transition-colors">
          <input
            type="file"
            id="contract-file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
          <label htmlFor="contract-file" className="cursor-pointer flex flex-col items-center gap-4">
            {selectedFile ? (
              <>
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(selectedFile.size / 1024)}KB</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PDF, Word, or Text files</p>
                </div>
              </>
            )}
          </label>
        </div>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing contract...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Analyze with AI</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>

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
    </>
  )
}
