import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

const MAX_BYTES = 4 * 1024 * 1024

/** Screenshots and screen recordings attached to a support ticket. */
export async function POST(req: Request) {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Plik jest za duży (maksymalnie 4 MB)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png"
  const who = session.email.replace(/[^a-z0-9]/gi, "_")
  const fileName = `support/${who}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const supabase = createServerClient()
  const { error } = await supabase.storage
    .from("obituary-photos")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from("obituary-photos").getPublicUrl(fileName)
  return NextResponse.json({ url: data.publicUrl, name: file.name })
}
