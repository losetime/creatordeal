import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, to, data } = body

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    let subject = ""
    let html = ""

    if (type === "invoice") {
      subject = `Invoice ${escapeHtml(data.invoiceNumber)} from CreatorDeal`
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
            .invoice-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { color: #6b7280; font-size: 14px; }
            .value { font-weight: 600; }
            .amount { font-size: 24px; color: #0d9488; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CreatorDeal</div>
            </div>
            <h2>Invoice from ${escapeHtml(data.creatorName || "Your Creator")}</h2>
            <div class="invoice-box">
              <div class="row">
                <span class="label">Invoice Number</span>
                <span class="value">${escapeHtml(data.invoiceNumber)}</span>
              </div>
              <div class="row">
                <span class="label">Deal</span>
                <span class="value">${escapeHtml(data.dealTitle)}</span>
              </div>
              <div class="row">
                <span class="label">Due Date</span>
                <span class="value">${escapeHtml(data.dueDate)}</span>
              </div>
              <div class="row">
                <span class="label">Amount</span>
                <span class="amount">$${Number(data.amount).toLocaleString()}</span>
              </div>
            </div>
            <p>Please review and process this invoice at your earliest convenience.</p>
            <div class="footer">
              <p>Sent via CreatorDeal - Sponsorship Management for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === "reminder") {
      subject = `Reminder: ${escapeHtml(data.title)}`
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { margin-bottom: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${escapeHtml(data.title)}</h2>
            </div>
            <div class="content">
              <p>${escapeHtml(data.message)}</p>
            </div>
            <div class="footer">
              <p>Sent via CreatorDeal - Sponsorship Management for Creators</p>
            </div>
          </div>
        </body>
        </html>
      `
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CreatorDeal <noreply@yourdomain.com>",
      to: [to],
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: emailData?.id })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
