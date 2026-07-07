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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  FileText, CheckCircle,
  Clock, Trash2, Eye, Sparkles, Scan, Plus, Search, Wand2, AlertTriangle, X
} from "lucide-react"
import { SmartDealCreator } from "@/components/smart-deal-creator"

export default function ContractsPage() {
  const { t } = useLocale()
  const [showUpload, setShowUpload] = useState(false)
  const [showSmartCreate, setShowSmartCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
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
      setShowDetail(false)
      setSelectedContractId(null)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const filteredContracts = contracts?.filter(
    (c) =>
      c.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.deals?.brands?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.deals?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedContract = contracts?.find((c) => c.id === selectedContractId)
  const aiSummary = selectedContract?.ai_summary
  const keyTerms = selectedContract?.key_terms
  const risks = selectedContract?.risks
  const usageRights = selectedContract?.usage_rights

  const handleViewContract = (contractId: string) => {
    setSelectedContractId(contractId)
    setShowDetail(true)
  }

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
              className="bg-black hover:bg-black/80 text-white"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Smart Create
            </Button>
            <Button
              onClick={() => {
                setShowUpload(!showUpload)
                setShowSmartCreate(false)
              }}
              className="bg-black hover:bg-black/80 text-white"
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

      {/* Manual Upload */}
      {showUpload && (
        <Card className="shadow-card overflow-hidden animate-slide-up">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add Contract</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal</label>
                <select
                  className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  value={""}
                  onChange={() => {}}
                >
                  <option value="">Select a deal to attach this contract to</option>
                  {deals?.map((deal: any) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title} — {deal.brands?.name || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contract File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button className="bg-black hover:bg-black/80 text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Contract
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Library */}
      <Card className="shadow-card overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-amber-500" />
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
        <CardContent className="px-4 pb-4">
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
                    className="group flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:shadow-card-hover cursor-pointer hover:bg-slate-50"
                    onClick={() => handleViewContract(contract.id)}
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
              <p className="text-sm mt-1">Upload a contract to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              {selectedContract?.file_name}
            </DialogTitle>
            <DialogDescription>
              {selectedContract?.deals?.brands?.name || "Unknown brand"}
              {selectedContract?.deals?.title ? ` • ${selectedContract.deals.title}` : ""}
              {selectedContract ? ` • ${formatDate(selectedContract.created_at)}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* AI Summary */}
            {aiSummary && (
              <div className="rounded-lg bg-teal-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">AI Summary</span>
                </div>
                <p className="text-sm text-teal-800">
                  {typeof aiSummary === 'object' && aiSummary.summary ? aiSummary.summary : aiSummary}
                </p>
              </div>
            )}

            {/* Risks */}
            {risks && risks.length > 0 && (
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    {risks.length} potential risk{risks.length > 1 ? "s" : ""} detected
                  </span>
                </div>
                <ul className="space-y-1">
                  {risks.map((risk: string, i: number) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Terms */}
            {keyTerms && keyTerms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Key Terms</h4>
                <div className="flex flex-wrap gap-2">
                  {keyTerms.map((term: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Rights */}
            {usageRights && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Usage Rights</h4>
                <p className="text-sm text-slate-600">
                  {typeof usageRights === 'object' ? JSON.stringify(usageRights) : usageRights}
                </p>
              </div>
            )}

            {/* View File Button */}
            {selectedContract?.file_url && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedContract.file_url!, "_blank")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
