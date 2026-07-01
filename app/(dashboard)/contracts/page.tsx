"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, FileText, AlertTriangle, CheckCircle, 
  Clock, DollarSign, Calendar, Shield, Search, Trash2, Eye 
} from "lucide-react"

const mockContracts = [
  {
    id: "1",
    name: "Nike_Contract_2026.pdf",
    brand: "Nike",
    upload_date: "2026-06-25",
    status: "analyzed",
    total_value: "$5,000",
    risks: 2,
  },
  {
    id: "2",
    name: "Apple_Agreement.pdf",
    brand: "Apple",
    upload_date: "2026-06-20",
    status: "analyzed",
    total_value: "$8,000",
    risks: 1,
  },
  {
    id: "3",
    name: "Samsung_MSA.docx",
    brand: "Samsung",
    upload_date: "2026-06-15",
    status: "pending",
    total_value: null,
    risks: 0,
  },
]

const mockAnalysis = {
  brand: "Nike",
  total_value: "$5,000",
  payment_terms: "Net 30",
  content_deadline: "2026-07-15",
  deliverables: [
    "1x YouTube integration (60-90 seconds)",
    "2x Instagram Stories",
    "1x Instagram Feed Post"
  ],
  usage_rights: {
    duration: "12 months",
    platforms: ["YouTube", "Instagram"],
    exclusivity: "Tech category, 30 days"
  },
  key_terms: [
    "First review rights for brand",
    "Approval required before posting",
    "No competing brands for 30 days"
  ],
  risks: [
    {
      clause: "Perpetual usage rights",
      severity: "high",
      suggestion: "Negotiate to 12 months maximum"
    },
    {
      clause: "Broad exclusivity clause",
      severity: "medium",
      suggestion: "Limit to specific product category"
    }
  ]
}

export default function ContractsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null)
  const [fileName, setFileName] = useState("")
  const [contracts, setContracts] = useState(mockContracts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContract, setSelectedContract] = useState<typeof mockContracts[0] | null>(null)

  const filteredContracts = contracts.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setFileName("Nike_Contract_2026.pdf")
    
    setTimeout(() => {
      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
      
      // Add to contracts list
      setContracts([
        {
          id: String(Date.now()),
          name: fileName || "New_Contract.pdf",
          brand: "Nike",
          upload_date: new Date().toISOString().split("T")[0],
          status: "analyzed",
          total_value: "$5,000",
          risks: 2,
        },
        ...contracts,
      ])
    }, 2000)
  }

  const deleteContract = (id: string) => {
    setContracts(contracts.filter((c) => c.id !== id))
  }

  const viewContract = (contract: typeof mockContracts[0]) => {
    setSelectedContract(contract)
    if (contract.status === "analyzed") {
      setAnalysis(mockAnalysis)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contract Scanner</h2>
        <p className="text-muted-foreground">
          Upload contracts to extract key terms and identify risks
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Upload Contract</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your contract file here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="max-w-xs"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFileName(e.target.files[0].name)
                  }
                }}
              />
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Contract
                  </>
                )}
              </Button>
            </div>
            {fileName && (
              <p className="mt-4 text-sm text-muted-foreground">
                Selected: {fileName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contract Library</CardTitle>
              <CardDescription>
                {contracts.length} contracts stored
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{contract.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.brand} • Uploaded {contract.upload_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {contract.total_value && (
                    <span className="font-medium">{contract.total_value}</span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      contract.status === "analyzed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {contract.status === "analyzed" ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Analyzed
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </span>
                  {contract.risks > 0 && (
                    <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {contract.risks} risks
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewContract(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteContract(contract.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Analysis Results</h3>
          
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-bold">{analysis.total_value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-bold">{analysis.content_deadline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-bold">{analysis.payment_terms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usage Rights</p>
                    <p className="font-bold">{analysis.usage_rights.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Key Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Key Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.key_terms.map((term, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Usage Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{analysis.usage_rights.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platforms</span>
                  <span className="font-medium">{analysis.usage_rights.platforms.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exclusivity</span>
                  <span className="font-medium">{analysis.usage_rights.exclusivity}</span>
                </div>
              </CardContent>
            </Card>

            {/* Risks */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Risks Identified
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.risks.map((risk, i) => (
                  <div key={i} className="rounded-lg border p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{risk.clause}</p>
                        <p className="text-sm text-muted-foreground mt-1">{risk.suggestion}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          risk.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept & Create Deal
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Full Contract
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
