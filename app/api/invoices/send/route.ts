import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import React from "react"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { invoice_id } = body

    if (!invoice_id) {
      return NextResponse.json({ error: "invoice_id required" }, { status: 400 })
    }

    // Use admin client to bypass RLS for all queries
    const admin = createAdminClient()

    // Fetch invoice
    const { data: invoice, error: invError } = await admin
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single()

    if (invError || !invoice) {
      return NextResponse.json({ error: "Invoice not found", details: invError }, { status: 404 })
    }

    // Fetch deal
    const { data: deal } = await admin
      .from("deals")
      .select("title, brand_id")
      .eq("id", invoice.deal_id)
      .single()

    // Fetch brand
    let brand: any = null
    if (deal?.brand_id) {
      const { data: brandData } = await supabase
        .from("brands")
        .select("name, contact_email, contact_name, address, country, tax_id")
        .eq("id", deal.brand_id)
        .single()
      brand = brandData
    }

    // Fallback: use user's own email if brand has no contact_email
    const contactEmail = brand?.contact_email || user.email

    // Fetch user profile for issuer info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, address, city, state, country, zip_code, tax_id")
      .eq("id", user.id)
      .single()

    if (!contactEmail) {
      return NextResponse.json(
        { error: "No contact email available. Please add an email to the brand or your profile." },
        { status: 400 }
      )
    }

    // Generate PDF using dynamic import of @react-pdf/renderer
    const { renderToBuffer, Document, Page, View, Text } = await import("@react-pdf/renderer")

    const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(v)

    const element = React.createElement(Document, null,
      React.createElement(Page, { size: "A4", style: { padding: 40, fontFamily: "Helvetica", fontSize: 10 } },
        React.createElement(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 } },
          React.createElement(Text, { style: { fontSize: 20, fontWeight: "bold", color: "#0d9488" } }, "CreatorDeal"),
          React.createElement(View, null,
            React.createElement(Text, { style: { fontSize: 28, fontWeight: "bold", color: "#0d9488", textAlign: "right" } }, "INVOICE"),
            React.createElement(Text, { style: { fontSize: 10, color: "#6b7280", textAlign: "right", marginTop: 4 } }, invoice.invoice_number)
          )
        ),
        React.createElement(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 } },
          React.createElement(View, { style: { width: "45%" } },
            React.createElement(Text, { style: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 } }, "From"),
            React.createElement(Text, { style: { fontSize: 11, fontWeight: "bold", marginBottom: 2 } }, profile?.full_name || "Creator"),
            React.createElement(Text, { style: { fontSize: 10, color: "#6b7280" } }, profile?.email || user.email)
          ),
          React.createElement(View, { style: { width: "45%" } },
            React.createElement(Text, { style: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 } }, "To"),
            React.createElement(Text, { style: { fontSize: 11, fontWeight: "bold", marginBottom: 2 } }, brand?.name || "Brand"),
            React.createElement(Text, { style: { fontSize: 10, color: "#6b7280" } }, contactEmail)
          )
        ),
        React.createElement(View, { style: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 4 } },
          React.createElement(Text, { style: { width: "55%", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Description"),
          React.createElement(Text, { style: { width: "15%", textAlign: "center", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Qty"),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Rate"),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 8, color: "#6b7280", textTransform: "uppercase" } }, "Amount")
        ),
        React.createElement(View, { style: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" } },
          React.createElement(Text, { style: { width: "55%", fontSize: 10 } }, deal?.title || "Sponsored Content"),
          React.createElement(Text, { style: { width: "15%", textAlign: "center", fontSize: 10 } }, "1"),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 10 } }, fmt(invoice.amount)),
          React.createElement(Text, { style: { width: "15%", textAlign: "right", fontSize: 10 } }, fmt(invoice.amount))
        ),
        React.createElement(View, { style: { marginTop: 20 } },
          React.createElement(View, { style: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 2, borderTopColor: "#0d9488", marginTop: 4 } },
            React.createElement(Text, { style: { fontSize: 12, fontWeight: "bold" } }, "Total"),
            React.createElement(Text, { style: { fontSize: 14, fontWeight: "bold", color: "#0d9488" } }, fmt(invoice.amount))
          )
        ),
        React.createElement(View, { style: { marginTop: 30 } },
          React.createElement(Text, { style: { fontSize: 8, color: "#9ca3af", marginBottom: 4 } }, "Due Date"),
          React.createElement(Text, { style: { fontSize: 10 } }, formatDate(invoice.due_date))
        ),
        React.createElement(Text, { style: { textAlign: "center", color: "#9ca3af", fontSize: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 15, marginTop: 30 } }, "Generated by CreatorDeal")
      )
    )

    const pdfBuffer = await renderToBuffer(element)

    // Upload PDF to Supabase Storage
    const pdfFileName = `${invoice.invoice_number}.pdf`
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(pdfFileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    let pdfUrl = ""
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("invoices").getPublicUrl(pdfFileName)
      pdfUrl = publicUrl
    }

    // Build email HTML
    const formatAmount = (val: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency || "USD",
      }).format(val)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488, #10b981); padding: 24px; border-radius: 8px; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: bold; color: white; }
          .subtitle { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
          .invoice-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { color: #6b7280; font-size: 13px; }
          .value { font-weight: 600; font-size: 13px; }
          .amount { font-size: 28px; color: #0d9488; font-weight: bold; margin: 16px 0; }
          .btn { display: inline-block; background: #0d9488; color: white !important; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 500; margin-right: 6px; }
          .btn-secondary { background: #6b7280; }
          .footer { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CreatorDeal</div>
            <div class="subtitle">Invoice from ${escapeHtml(profile?.full_name || "Creator")}</div>
          </div>
          
          <div class="invoice-box">
            <div class="row">
              <span class="label">Invoice Number</span>
              <span class="value">${escapeHtml(invoice.invoice_number)}</span>
            </div>
            <div class="row">
              <span class="label">Deal</span>
              <span class="value">${escapeHtml(invoice.deals?.title || "")}</span>
            </div>
            <div class="row">
              <span class="label">Issue Date</span>
              <span class="value">${formatDate(invoice.created_at)}</span>
            </div>
            <div class="row">
              <span class="label">Due Date</span>
              <span class="value">${formatDate(invoice.due_date)}</span>
            </div>
            <div class="amount">${formatAmount(invoice.amount)}</div>
          </div>

          <p>Please review and process this invoice at your earliest convenience.</p>
          
          <p style="margin-top: 16px;">
            ${pdfUrl ? `<a href="${pdfUrl}" class="btn">Download PDF</a>` : ""}
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://creatordeal.cyberloom.work"}/invoices" class="btn btn-secondary">View in App</a>
          </p>

          <div class="footer">
            <p>Sent via CreatorDeal — Sponsorship Management for Creators</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email with PDF attachment
    const { error: emailError } = await getResend().emails.send({
      from: `${profile?.full_name || "Creator"} via CreatorDeal <${process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com"}>`,
      to: [contactEmail],
      subject: `${profile?.full_name || "Creator"} — Invoice ${invoice.invoice_number}`,
      text: `Invoice ${invoice.invoice_number}\n\nAmount: ${formatAmount(invoice.amount)}\nDue: ${formatDate(invoice.due_date)}\n\nPlease review and process this invoice at your earliest convenience.\n\nSent via CreatorDeal — Sponsorship Management for Creators`,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_APP_URL || "https://creatordeal.cyberloom.work"}/invoices>`,
      },
      attachments: pdfUrl
        ? [
            {
              filename: pdfFileName,
              path: pdfUrl,
            },
          ]
        : undefined,
    })

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    // Update invoice status to 'sent'
    await supabase
      .from("invoices")
      .update({
        status: "sent",
        pdf_url: pdfUrl,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice_id)

    // Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "deal_update",
      title: "Invoice sent",
      message: `${invoice.invoice_number} sent to ${contactEmail}`,
      deal_id: invoice.deal_id,
    })

    return NextResponse.json({ success: true, pdfUrl })
  } catch (error: any) {
    console.error("Send invoice error:", error)
    return NextResponse.json({ error: "Failed to send invoice", details: error?.message || String(error) }, { status: 500 })
  }
}
