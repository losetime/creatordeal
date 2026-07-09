import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const S = {
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 30 },
  logo: { fontSize: 20, fontWeight: "bold" as const, color: "#0d9488" },
  invoiceTitle: { fontSize: 28, fontWeight: "bold" as const, color: "#0d9488", textAlign: "right" as const },
  invoiceNumber: { fontSize: 10, color: "#6b7280", textAlign: "right" as const, marginTop: 4 },
  parties: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 30 },
  partyBlock: { width: "45%" },
  partyLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 4 },
  partyName: { fontSize: 11, fontWeight: "bold" as const, marginBottom: 2 },
  partyText: { fontSize: 10, color: "#6b7280" },
  tableHeader: { flexDirection: "row" as const, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 4 },
  tableHeaderText: { fontSize: 8, color: "#6b7280", textTransform: "uppercase" as const },
  tableRow: { flexDirection: "row" as const, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  colDesc: { width: "55%", fontSize: 10 },
  colQty: { width: "15%", textAlign: "center" as const, fontSize: 10 },
  colRate: { width: "15%", textAlign: "right" as const, fontSize: 10 },
  colAmount: { width: "15%", textAlign: "right" as const, fontSize: 10 },
  grandTotalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 8, borderTopWidth: 2, borderTopColor: "#0d9488", marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold" as const },
  grandTotalValue: { fontSize: 14, fontWeight: "bold" as const, color: "#0d9488" },
  footer: { textAlign: "center" as const, color: "#9ca3af", fontSize: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 15, marginTop: 30 },
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { invoice_id } = await request.json()
    if (!invoice_id) return NextResponse.json({ error: "invoice_id required" }, { status: 400 })

    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*, deals(title, brand_id)")
      .eq("id", invoice_id).eq("user_id", user.id).single()

    if (invError || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    const { data: profile } = await supabase
      .from("profiles").select("full_name, email").eq("id", user.id).single()

    let brand: any = null
    if (invoice.deals?.brand_id) {
      const { data: brandData } = await supabase
        .from("brands").select("name").eq("id", invoice.deals.brand_id).single()
      brand = brandData
    }
    const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(v)

    const { Document, Page, View, Text } = require("@react-pdf/renderer")

    const el = React.createElement(Document, null,
      React.createElement(Page, { size: "A4", style: S.page },
        React.createElement(View, { style: S.header },
          React.createElement(Text, { style: S.logo }, "CreatorDeal"),
          React.createElement(View, null,
            React.createElement(Text, { style: S.invoiceTitle }, "INVOICE"),
            React.createElement(Text, { style: S.invoiceNumber }, invoice.invoice_number)
          )
        ),
        React.createElement(View, { style: S.parties },
          React.createElement(View, { style: S.partyBlock },
            React.createElement(Text, { style: S.partyLabel }, "From"),
            React.createElement(Text, { style: S.partyName }, profile?.full_name || "Creator"),
            React.createElement(Text, { style: S.partyText }, profile?.email || user.email)
          ),
          React.createElement(View, { style: S.partyBlock },
            React.createElement(Text, { style: S.partyLabel }, "To"),
            React.createElement(Text, { style: S.partyName }, brand?.name || "Brand")
          )
        ),
        React.createElement(View, { style: S.tableHeader },
          React.createElement(Text, { style: { width: "55%", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Description"),
          React.createElement(Text, { style: { width: "15%", textAlign: "center", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Qty"),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Rate"),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Amount")
        ),
        React.createElement(View, { style: S.tableRow },
          React.createElement(Text, { style: S.colDesc }, invoice.deals?.title || "Sponsored Content"),
          React.createElement(Text, { style: S.colQty }, "1"),
          React.createElement(Text, { style: S.colRate }, fmt(invoice.amount)),
          React.createElement(Text, { style: S.colAmount }, fmt(invoice.amount))
        ),
        React.createElement(View, { style: { marginTop: 20 } },
          React.createElement(View, { style: S.grandTotalRow },
            React.createElement(Text, { style: S.grandTotalLabel }, "Total"),
            React.createElement(Text, { style: S.grandTotalValue }, fmt(invoice.amount))
          )
        ),
        React.createElement(View, { style: { marginTop: 30 } },
          React.createElement(Text, { style: { fontSize: 8, color: "#9ca3af", marginBottom: 4 } }, "Due Date"),
          React.createElement(Text, { style: { fontSize: 10 } }, formatDate(invoice.due_date))
        ),
        React.createElement(Text, { style: S.footer }, "Generated by CreatorDeal")
      )
    )

    const pdfBuffer = await renderToBuffer(el)
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("Download invoice error:", error?.message || error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
