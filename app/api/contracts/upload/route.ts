import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateStoragePath } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const dealId = formData.get("deal_id") as string | null

    if (!file || !dealId) {
      return NextResponse.json({ error: "file and deal_id required" }, { status: 400 })
    }

    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Verify deal ownership
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("id")
      .eq("id", dealId)
      .eq("user_id", user.id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    }

    // Upload file to Supabase Storage
    const storageFileName = generateStoragePath(user.id, "contracts", file.name, dealId)
    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(storageFileName, file, {
        contentType: file.type || "application/pdf",
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from("contracts")
      .createSignedUrl(storageFileName, 3600)

    const fileUrl = urlData?.signedUrl || ""

    // Create contract record
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .insert({
        deal_id: dealId,
        file_name: file.name,
        file_url: fileUrl,
      })
      .select()
      .single()

    if (contractError) {
      return NextResponse.json({ error: contractError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contract })
  } catch (error) {
    console.error("Contract upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
