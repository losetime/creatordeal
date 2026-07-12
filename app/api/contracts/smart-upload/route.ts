import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseContract, ContractData } from "@/lib/ai/contract-parser"
import { generateStoragePath } from "@/lib/utils"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

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

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Invalid file type. Please upload PDF, Word, or text files." }, { status: 400 })
    }

    // Upload file to Supabase Storage (temp path without deal_id)
    const storageFileName = generateStoragePath(user.id, "contracts", file.name, "temp")
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

    // Extract text content from file
    let contractText = ""

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      // For text files, read directly
      contractText = await file.text()
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF files, extract text using pdf2json
      const tmpFile = join(tmpdir(), `contract-${Date.now()}.pdf`)
      try {
        const arrayBuffer = await file.arrayBuffer()
        await writeFile(tmpFile, Buffer.from(arrayBuffer))

        const PDFParser = (await import("pdf2json")).default
        const parser = new PDFParser()

        contractText = await new Promise<string>((resolve, reject) => {
          parser.on("pdfParser_dataError", (err: any) => reject(err))
          parser.on("pdfParser_dataReady", (data: any) => {
            let result = ""
            data.Pages.forEach((page: any) => {
              page.Texts.forEach((textItem: any) => {
                try {
                  result += decodeURIComponent(textItem.R[0].T) + " "
                } catch {
                  result += textItem.R[0].T + " "
                }
              })
              result += "\n"
            })
            resolve(result)
          })
          parser.loadPDF(tmpFile)
        })
      } catch (pdfError: any) {
        console.error("PDF text extraction failed:", pdfError?.message || pdfError)
        contractText = `[Contract: ${file.name}]`
      } finally {
        await unlink(tmpFile).catch(() => {})
      }
    } else {
      // For Word files or other formats, use filename as context
      contractText = `[Contract: ${file.name}]`
    }

    // Check if we got meaningful text
    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json({
        success: true,
        fileUrl,
        fileName: file.name,
        storagePath: storageFileName,
        parsedData: null,
        aiError: "Could not extract text from file. Please fill in the details manually.",
      })
    }

    // Parse contract with AI
    let parsedData: ContractData

    try {
      parsedData = await parseContract(contractText)
    } catch (aiError) {
      console.error("AI parsing failed")
      return NextResponse.json({
        success: true,
        fileUrl,
        fileName: file.name,
        storagePath: storageFileName,
        parsedData: null,
        aiError: "AI parsing failed. Please fill in the details manually.",
      })
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      storagePath: storageFileName,
      parsedData,
    })
  } catch (error) {
    console.error("Smart upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
