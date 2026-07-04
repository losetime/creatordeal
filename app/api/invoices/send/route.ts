import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { InvoicePDF } from "@/components/invoice-pdf"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Fetch invoice with deal and brand info
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*, deals(title, brand_id, brands(name, contact_email, contact_name, address, country, tax_id))")
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single()

    if (invError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Fetch user profile for issuer info
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, address, city, state, country, zip_code, tax_id")
      .eq("id", user.id)
      .single()

    const brand = invoice.deals?.brands
    if (!brand?.contact_email) {
      return NextResponse.json(
        { error: "Brand contact email not found. Please add an email to the brand." },
        { status: 400 }
      )
    }

    // Generate PDF
    const element = React.createElement(InvoicePDF, {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: formatDate(invoice.created_at),
      dueDate: formatDate(invoice.due_date),
      amount: invoice.amount,
      currency: invoice.currency || "USD",
      taxRate: invoice.tax_rate || 0,
      taxAmount: invoice.tax_amount || 0,
      notes: invoice.notes,
      paymentTerms: invoice.payment_terms || "Net 30",
      issuer: {
        name: profile?.full_name || "Creator",
        email: profile?.email || user.email || "",
        address: [profile?.address, profile?.city, profile?.state, profile?.zip_code, profile?.country]
          .filter(Boolean)
          .join(", "),
          taxId: profile?.tax_id || undefined,
        },
        recipient: {
          name: brand.name,
          email: brand.contact_email,
          address: brand.address || undefined,
          taxId: brand.tax_id || undefined,
        },
        items: [
          {
            description: invoice.deals?.title || "Sponsored Content",
            quantity: 1,
            rate: invoice.amount,
            amount: invoice.amount,
          },
        ],
      })

    const pdfBuffer = await renderToBuffer(element as any)

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
          .btn { display: inline-block; background: #0d9488; color: white !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-right: 8px; }
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://creatordeal.app"}/invoices" class="btn btn-secondary">View in App</a>
          </p>

          <div class="footer">
            <p>Sent via CreatorDeal — Sponsorship Management for Creators</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email with PDF attachment
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CreatorDeal <noreply@yourdomain.com>",
      to: [brand.contact_email],
      subject: `Invoice ${invoice.invoice_number} from ${profile?.full_name || "Creator"}`,
      html: emailHtml,
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
      message: `${invoice.invoice_number} sent to ${brand.contact_email}`,
      deal_id: invoice.deal_id,
    })

    return NextResponse.json({ success: true, pdfUrl })
  } catch (error) {
    console.error("Send invoice error:", error)
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 })
  }
}
