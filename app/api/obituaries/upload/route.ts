import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const fileName = `${session.email.replace(/[^a-z0-9]/gi, "_")}/${Date.now()}.${ext}`

  const supabase = createServerClient()
  const { error } = await supabase.storage
    .from("obituary-photos")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage
    .from("obituary-photos")
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
