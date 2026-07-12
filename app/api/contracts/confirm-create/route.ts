import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { generateStoragePath } from "@/lib/utils"

const createDealSchema = z.object({
  // Brand info
  brand_name: z.string().min(1),
  brand_contact_name: z.string().optional().nullable(),
  brand_contact_email: z.string().optional().nullable(),
  brand_website: z.string().optional().nullable(),

  // Deal info
  title: z.string().min(1),
  amount: z.number().positive().optional().nullable(),
  currency: z.string().default("USD"),
  content_type: z.string().optional().nullable(),
  content_deadline: z.string().optional().nullable(),
  payment_deadline: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),

  // Contract info
  file_url: z.string(),
  file_name: z.string(),
  storage_path: z.string(),
  ai_summary: z.any().optional().nullable(),
  key_terms: z.array(z.string()).optional().nullable(),
  risks: z.array(z.string()).optional().nullable(),
  usage_rights: z.string().optional().nullable(),

  // Deliverables
  deliverables: z.array(z.object({
    type: z.string(),
    description: z.string(),
    quantity: z.number().default(1),
  })).optional().nullable(),
})

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
    const validatedData = createDealSchema.parse(body)

    // Check plan limits for free users
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()

    if (profile?.plan === "free") {
      // Count active deals (not closed)
      const { count } = await supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("stage", "closed")

      if (count && count >= 3) {
        return NextResponse.json({
          error: "DEAL_LIMIT_REACHED",
          message: "You've reached the free plan limit of 3 active deals.",
          upgradeMessage: "Upgrade to Creator Club for unlimited deals, smart invoicing, AI contract scanner, and more.",
          upgradeUrl: "/subscription"
        }, { status: 403 })
      }
    }

    // 1. Create or find brand
    let brandId: string | null = null

    // Check if brand already exists
    const { data: existingBrand } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", validatedData.brand_name)
      .single()

    if (existingBrand) {
      brandId = existingBrand.id
    } else {
      // Create new brand
      const { data: newBrand, error: brandError } = await supabase
        .from("brands")
        .insert({
          user_id: user.id,
          name: validatedData.brand_name,
          contact_name: validatedData.brand_contact_name,
          contact_email: validatedData.brand_contact_email,
          website: validatedData.brand_website,
        })
        .select("id")
        .single()

      if (brandError) {
        console.error("Brand creation error:", brandError)
        return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
      }

      brandId = newBrand.id
    }

    // 2. Create deal
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .insert({
        user_id: user.id,
        brand_id: brandId,
        title: validatedData.title,
        amount: validatedData.amount,
        currency: validatedData.currency,
        content_type: validatedData.content_type,
        content_deadline: validatedData.content_deadline || null,
        payment_deadline: validatedData.payment_deadline || null,
        payment_terms: validatedData.payment_terms || null,
        stage: "signed", // Start at signed since we have a contract
      })
      .select("id")
      .single()

    if (dealError) {
      console.error("Deal creation error:", dealError)
      return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
    }

    // 3. Move contract from temp to deal folder and create contract record
    const newStoragePath = generateStoragePath(user.id, "contracts", validatedData.file_name, deal.id)

    // Move file in storage
    const { error: moveError } = await supabase.storage
      .from("contracts")
      .move(validatedData.storage_path, newStoragePath)

    // Get new signed URL
    const { data: newUrlData } = await supabase.storage
      .from("contracts")
      .createSignedUrl(newStoragePath, 3600 * 24 * 7) // 7 days

    const newFileUrl = newUrlData?.signedUrl || validatedData.file_url

    // Create contract record
    const { error: contractError } = await supabase
      .from("contracts")
      .insert({
        deal_id: deal.id,
        file_name: validatedData.file_name,
        file_url: newFileUrl,
        ai_summary: validatedData.ai_summary ? { summary: validatedData.ai_summary } : null,
        key_terms: validatedData.key_terms || null,
        risks: validatedData.risks || null,
        usage_rights: validatedData.usage_rights || null,
      })

    if (contractError) {
      console.error("Contract creation error:", contractError)
      // Non-critical - continue
    }

    // 4. Create deliverables if provided
    if (validatedData.deliverables && validatedData.deliverables.length > 0) {
      const deliverables = validatedData.deliverables.map((d) => ({
        deal_id: deal.id,
        type: d.type,
        description: d.description,
        quantity: d.quantity,
        status: "pending" as const,
      }))

      const { error: deliverablesError } = await supabase
        .from("deliverables")
        .insert(deliverables)

      if (deliverablesError) {
        console.error("Deliverables creation error:", deliverablesError)
        // Non-critical - continue
      }
    }

    // 5. Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "deal_update",
      title: "Deal created from contract",
      message: `"${validatedData.title}" was created from uploaded contract`,
      deal_id: deal.id,
    })

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      brandId,
    })
  } catch (error: any) {
    console.error("Confirm create error:", error?.message || error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 })
  }
}
