import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageBase64 = formData.get("image") as string

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 })
    }

    // Upload to imgbb
    const uploadFormData = new FormData()
    uploadFormData.append("image", imageBase64)

    const response = await fetch(
      "https://api.imgbb.com/1/upload?expiration=86400&key=2ae468065db125826b9f84f1409b06bc",
      {
        method: "POST",
        body: uploadFormData,
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data, // result.data berisi display_url, url, dll.
      })
    } else {
      return NextResponse.json({ success: false, error: "Upload failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 })
  }
}
