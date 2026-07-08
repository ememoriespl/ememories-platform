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
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()

  if (session.role === "admin") {
    const { data, error } = await supabase
      .from("print_templates")
      .select("*")
      .is("funeral_home_id", null)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Own templates plus admin-provided global starter templates (funeral_home_id null)
  const { data, error } = await supabase
    .from("print_templates")
    .select("*")
    .or(`funeral_home_id.eq.${funeralHomeId},funeral_home_id.is.null`)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, template } = body

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nazwa szablonu jest wymagana" }, { status: 400 })
  }
  if (!template || typeof template !== "object") {
    return NextResponse.json({ error: "Brak danych szablonu" }, { status: 400 })
  }

  let funeralHomeId: string | null = null
  if (session.role === "funeral-home") {
    funeralHomeId = await getFuneralHomeId(session.email)
    if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("print_templates")
    .insert({
      funeral_home_id: funeralHomeId,
      name: name.trim(),
      template,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
