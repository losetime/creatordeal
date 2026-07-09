import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const admin = createAdminClient()
    const resend = new Resend(process.env.RESEND_API_KEY)
    const results = { deadlineEmails: 0, paymentEmails: 0, errors: [] as string[] }

    // Get all users with notification preferences
    const { data: preferences } = await admin
      .from("notification_preferences")
      .select("*")

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: "No notification preferences configured. Users can set them in Settings.", results })
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: "No preferences found", results })
    }

    for (const pref of preferences) {
      try {
        // Get user profile
        const { data: userProfile } = await admin
          .from("profiles")
          .select("email, full_name")
          .eq("id", pref.user_id)
          .single()

        if (!userProfile?.email) continue

        // Check deal content deadlines (only 3 days and today)
        if (pref.email_deadline_3d || pref.email_deadline_today) {
          const { data: deals } = await admin
            .from("deals")
            .select("id, title, content_deadline, brands(name)")
            .eq("user_id", pref.user_id)
            .not("content_deadline", "is", null)
            .in("stage", ["signed", "creating", "review", "published"])

          if (deals) {
            for (const deal of deals) {
              if (!deal.content_deadline) continue
              const daysLeft = getDaysUntil(deal.content_deadline)
              const brandName = (deal.brands as any)?.name || "Unknown Brand"

              let shouldSend = false
              let subject = ""
              let urgency = ""

              if (daysLeft === 0 && pref.email_deadline_today) {
                shouldSend = true
                subject = `⏰ Due Today: "${deal.title}" with ${brandName}`
                urgency = "is due today"
              } else if (daysLeft === 3 && pref.email_deadline_3d) {
                shouldSend = true
                subject = `📋 Due in 3 days: "${deal.title}" with ${brandName}`
                urgency = "is due in 3 days"
              }

              if (shouldSend && daysLeft >= 0) {
                await resend.emails.send({
                  from: `${userProfile.full_name || "Creator"} via CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
                  to: [userProfile.email],
                  subject,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h2 style="color: #0d9488;">Content Deadline Reminder</h2>
                      <p>Hi ${userProfile.full_name || "there"},</p>
                      <p>Your deal <strong>"${deal.title}"</strong> with <strong>${brandName}</strong> ${urgency}.</p>
                      <div style="background: #f0fdf4; border-left: 4px solid #0d9488; padding: 12px; margin: 16px 0;">
                        <p style="margin: 0;"><strong>Deadline:</strong> ${formatDate(deal.content_deadline)}</p>
                      </div>
                      <p>Please make sure to deliver the content on time.</p>
                      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Sent via CreatorDeal</p>
                    </div>
                  `,
                })
                results.deadlineEmails++
              }
            }
          }
        }

        // Check invoice payment deadlines (1 day after due, skip if paid)
        if (pref.email_payment_overdue) {
          const { data: invoices } = await admin
            .from("invoices")
            .select("id, invoice_number, amount, currency, due_date, paid_at, status, deals(title, brand_id, brands(name, contact_email))")
            .eq("user_id", pref.user_id)
            .in("status", ["sent", "viewed", "overdue"])
            .not("due_date", "is", null)
            .is("paid_at", null)

          if (invoices) {
            for (const invoice of invoices) {
              if (!invoice.due_date) continue
              const daysLeft = getDaysUntil(invoice.due_date)
              const dealTitle = (invoice.deals as any)?.title || "Unknown Deal"
              const brandName = (invoice.deals as any)?.brands?.name || "Unknown Brand"
              const brandEmail = (invoice.deals as any)?.brands?.contact_email
              const amount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: invoice.currency || "USD",
              }).format(invoice.amount)

              // Payment reminders go to brand contact, skip if already paid
              if (!brandEmail) continue
              if (invoice.paid_at) continue

              // Only remind 1 day after due date
              if (daysLeft === -1) {
                await resend.emails.send({
                  from: `${userProfile.full_name || "Creator"} via CreatorDeal <${process.env.RESEND_FROM_EMAIL}>`,
                  to: [brandEmail],
                  subject: `🔴 Payment Overdue: Invoice ${invoice.invoice_number}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h2 style="color: #0d9488;">Payment Reminder</h2>
                      <p>Hi,</p>
                      <p>Invoice <strong>${invoice.invoice_number}</strong> for <strong>${dealTitle}</strong> was due yesterday and is now <strong>overdue</strong>.</p>
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;">
                        <p style="margin: 0;"><strong>Amount:</strong> ${amount}</p>
                        <p style="margin: 4px 0 0 0;"><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
                      </div>
                      <p>Please ensure timely payment to maintain good relationships with your partners.</p>
                      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Sent via CreatorDeal — Sponsorship Management for Creators</p>
                    </div>
                  `,
                })
                results.paymentEmails++
              }
            }
          }
        }
      } catch (error: any) {
        results.errors.push(`Error for user ${pref.user_id}: ${error.message}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error("Trigger notifications error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
