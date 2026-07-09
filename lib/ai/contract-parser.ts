import { chatCompletion } from "./client"

export interface ContractData {
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

const SYSTEM_PROMPT = `You are a contract analysis AI for content creators/influencers. 
Extract key information from brand partnership contracts.

Return a JSON object with the following structure (use null for missing fields):
{
  "brand_name": "Company/brand name",
  "brand_contact_name": "Contact person at brand",
  "brand_contact_email": "Contact email",
  "brand_website": "Brand website URL",
  "deal_title": "Campaign/project title or description",
  "amount": numeric amount (number, not string),
  "currency": "USD/EUR/GBP/etc",
  "content_type": "Instagram Post, TikTok Video, YouTube Integration, etc",
  "deliverables": [
    {
      "type": "content type",
      "description": "what to deliver",
      "quantity": 1
    }
  ],
  "content_deadline": "YYYY-MM-DD format",
  "payment_deadline": "YYYY-MM-DD format",
  "payment_terms": "Net 30, upon receipt, etc",
  "usage_rights": "usage rights description",
  "key_terms": ["important clause 1", "important clause 2"],
  "risks": ["risk 1", "risk 2"],
  "summary": "brief 2-3 sentence summary"
}

Rules:
1. Extract amounts as numbers (e.g., 5000 not "$5,000")
2. Convert all dates to YYYY-MM-DD format
3. If content type is not explicitly stated, infer from context
4. List any concerning terms in "risks" (exclusivity, low payment terms, broad usage rights, etc)
5. Return ONLY valid JSON, no markdown or explanations`

export async function parseContract(contractText: string): Promise<ContractData> {
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: `Analyze this contract and extract the key information:\n\n${contractText}` },
  ]

  const response = await chatCompletion(messages, {
    temperature: 0.1,
    max_tokens: 3000,
  })

  // Clean up response - remove markdown code blocks if present
  let cleaned = response.trim()
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3)
  }

  try {
    const data = JSON.parse(cleaned.trim())
    return normalizeContractData(data)
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e)
    throw new Error("Failed to parse contract data from AI response")
  }
}

function normalizeContractData(data: any): ContractData {
  // Helper to ensure value is an array
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val
    if (typeof val === "string" && val) return [val]
    return []
  }

  return {
    brand_name: data.brand_name || null,
    brand_contact_name: data.brand_contact_name || null,
    brand_contact_email: data.brand_contact_email || null,
    brand_website: data.brand_website || null,
    deal_title: data.deal_title || null,
    amount: typeof data.amount === "number" ? data.amount : null,
    currency: data.currency || "USD",
    content_type: data.content_type || null,
    deliverables: Array.isArray(data.deliverables) ? data.deliverables.map((d: any) => ({
      type: d.type || "Content",
      description: d.description || "",
      quantity: typeof d.quantity === "number" ? d.quantity : 1,
    })) : null,
    content_deadline: data.content_deadline || null,
    payment_deadline: data.payment_deadline || null,
    payment_terms: data.payment_terms || null,
    usage_rights: data.usage_rights || null,
    key_terms: toArray(data.key_terms),
    risks: toArray(data.risks),
    summary: data.summary || "",
  }
}

export async function extractTextFromFile(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  const contentType = response.headers.get("content-type") || ""

  // Handle plain text files
  if (contentType.includes("text") || fileUrl.endsWith(".txt")) {
    return await response.text()
  }

  // Handle PDF files
  if (contentType.includes("pdf") || fileUrl.endsWith(".pdf")) {
    const buffer = await response.arrayBuffer()
    const { PDFParse } = await import("pdf-parse")
    const parser = new PDFParse({ data: Buffer.from(buffer) })
    const result = await parser.getText()
    return result.text
  }

  // Handle Word documents (basic extraction)
  if (
    contentType.includes("word") ||
    contentType.includes("document") ||
    fileUrl.endsWith(".docx") ||
    fileUrl.endsWith(".doc")
  ) {
    // For Word docs, we'd need mammoth or similar library
    // For now, return filename as context
    return `[Contract document: ${fileUrl.split("/").pop()}]`
  }

  return ""
}
