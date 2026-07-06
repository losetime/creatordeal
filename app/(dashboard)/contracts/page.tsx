"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  FileText, CheckCircle,
  Clock, Trash2, Eye, Sparkles, Scan, Plus, Search, Wand2
} from "lucide-react"
import { SmartDealCreator } from "@/components/smart-deal-creator"

export default function ContractsPage() {
  const { t } = useLocale()
  const [showUpload, setShowUpload] = useState(false)
  const [showSmartCreate, setShowSmartCreate] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploading, setUploading] = useState(false)

  const { data: contracts, isLoading: contractsLoading } = trpc.contracts.list.useQuery()
  const { data: deals, isLoading: dealsLoading } = trpc.deals.list.useQuery()
  const utils = trpc.useUtils()

  const deleteContract = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contract deleted")
      utils.contracts.list.invalidate()
      if (selectedContractId) setSelectedContractId(null)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleUpload = async () => {
    if (!selectedDealId || !selectedFile) {
      toast.error("Please select a deal and choose a file")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("deal_id", selectedDealId)

      const res = await fetch("/api/contracts/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Upload failed")
      } else {
        toast.success("Contract uploaded")
        utils.contracts.list.invalidate()
        setShowUpload(false)
        setSelectedDealId("")
        setSelectedFile(null)
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const selectedContract = contracts?.find((c) => c.id === selectedContractId)
  const hasAnalysis = !!selectedContract?.ai_summary

  const filteredContracts = contracts?.filter(
    (c) =>
      c.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.deals?.brands?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.deals?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-1.5">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("contracts.title")}</h2>
              <p className="text-xs opacity-80">{t("contracts.subtitle")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowSmartCreate(true)
                setShowUpload(false)
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Smart Create
            </Button>
            <Button
              onClick={() => {
                setShowUpload(!showUpload)
                setShowSmartCreate(false)
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Manual Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Smart Create */}
      {showSmartCreate && (
        <SmartDealCreator
          onComplete={() => {
            setShowSmartCreate(false)
            utils.contracts.list.invalidate()
            utils.deals.list.invalidate()
          }}
        />
      )}

      {/* Upload Area */}
      {showUpload && (
        <Card className="shadow-card overflow-hidden animate-slide-up">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add Contract</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal</label>
                {dealsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal to attach this contract to" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals?.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                          {deal.brands?.name ? ` — ${deal.brands.name}` : ""}
                        </SelectItem>
                      ))}
                      {deals?.length === 0 && (
                        <SelectItem value="none" disabled>
                          No deals found. Create a deal first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contract File</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-background"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">{selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !selectedDealId || !selectedFile}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md"
                >
                  {uploading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Contract
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Library + Detail View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contract List */}
        <div className={selectedContractId ? "lg:col-span-1" : "lg:col-span-3"}>
          <Card className="shadow-card overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-rose-500" />
                    Contract Library
                  </CardTitle>
                  <CardDescription>
                    {contractsLoading ? (
                      <Skeleton className="h-4 w-32 mt-1" />
                    ) : (
                      `${contracts?.length ?? 0} contract${(contracts?.length ?? 0) !== 1 ? "s" : ""} stored`
                    )}
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredContracts && filteredContracts.length > 0 ? (
                <div className="space-y-3">
                  {filteredContracts.map((contract) => {
                    const brand = contract.deals?.brands?.name
                    const deal = contract.deals?.title
                    return (
                      <div
                        key={contract.id}
                        className={`group flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:shadow-card-hover cursor-pointer ${
                          selectedContractId === contract.id
                            ? "bg-teal-50 ring-1 ring-teal-200"
                            : "hover:bg-gradient-to-r hover:from-teal-50/50 to-transparent"
                        }`}
                        onClick={() => setSelectedContractId(contract.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100">
                            <FileText className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold group-hover:text-teal-700 transition-colors">
                              {contract.file_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {brand || "Unknown brand"} {deal ? `• ${deal}` : ""} • {formatDate(contract.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {contract.ai_summary ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 px-3 py-1.5">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Analyzed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 px-3 py-1.5">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Pending
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteContract.mutate({ id: contract.id })
                            }}
                            disabled={deleteContract.isPending}
                            className="hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">No contracts yet</p>
                  <p className="text-sm mt-1">Add a contract to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        {selectedContractId && (
          <div className="lg:col-span-2 animate-slide-up">
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-teal-500" />
                      {selectedContract?.file_name}
                    </CardTitle>
                    <CardDescription>
                      {selectedContract?.deals?.brands?.name || "Unknown brand"}
                      {selectedContract?.deals?.title ? ` • ${selectedContract.deals.title}` : ""}
                      {selectedContract ? ` • Added ${formatDate(selectedContract.created_at)}` : ""}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedContract?.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedContract.file_url!, "_blank")}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View File
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedContractId(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hasAnalysis ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 text-center">
                      <Sparkles className="mx-auto h-8 w-8 text-teal-500 mb-2" />
                      <p className="font-medium">AI Analysis Results</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Full analysis display is under development.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-10 text-center">
                    <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 p-4 mb-4">
                      <Sparkles className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">AI analysis coming soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Contract analysis will automatically extract key terms, payment details, deliverables, and identify potential risks once this feature is available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
