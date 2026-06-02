import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

async function getFuneralHomeId(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("funeral_homes")
    .select("id")
    .eq("email", email)
    .single()
  return data?.id ?? null
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("obituaries")
    .select("*")
    .eq("funeral_home_id", funeralHomeId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { first_name, last_name, birth_date, death_date, obituary_text, ceremony_info, location, photo_url, photo_bw, status } = body

  if (!first_name || !last_name) {
    return NextResponse.json({ error: "Imię i nazwisko są wymagane" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("obituaries")
    .insert({
      funeral_home_id: funeralHomeId,
      first_name,
      last_name,
      birth_date: birth_date || null,
      death_date: death_date || null,
      obituary_text: obituary_text ?? "",
      ceremony_info: ceremony_info ?? "",
      location: location ?? "",
      photo_url: photo_url ?? null,
      photo_bw: photo_bw ?? false,
      status: status ?? "draft",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment qr_used when publishing
  if (status === "published") {
    await supabase.rpc("increment_qr_used", { fh_id: funeralHomeId })
  }

  return NextResponse.json(data, { status: 201 })
}
