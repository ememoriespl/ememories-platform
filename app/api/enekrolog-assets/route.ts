import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

/** Reusable eNekrolog imagery: cover banners and full-screen backgrounds. */
const KINDS = ["cover", "background"] as const
type Kind = (typeof KINDS)[number]

async function getFuneralHomeId(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("funeral_homes")
    .select("id")
    .eq("email", email)
    .single()
  return data?.id ?? null
}

async function nextSortOrder(scope: { funeralHomeId: string | null; kind: Kind }) {
  const supabase = createServerClient()
  let query = supabase
    .from("enekrolog_assets")
    .select("sort_order")
    .eq("kind", scope.kind)
    .order("sort_order", { ascending: false })
    .limit(1)
  query = scope.funeralHomeId === null ? query.is("funeral_home_id", null) : query.eq("funeral_home_id", scope.funeralHomeId)
  const { data } = await query.maybeSingle()
  return (data?.sort_order ?? -1) + 1
}

export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()

  if (session.role === "admin") {
    const { data, error } = await supabase
      .from("enekrolog_assets")
      .select("*")
      .is("funeral_home_id", null)
      .order("sort_order", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Own uploads plus admin-provided defaults (funeral_home_id null, is_default true)
  const { data, error } = await supabase
    .from("enekrolog_assets")
    .select("*")
    .or(`funeral_home_id.eq.${funeralHomeId},and(funeral_home_id.is.null,is_default.eq.true)`)
    .order("is_default", { ascending: false })
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, url, kind } = body

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 })
  }
  if (!url || typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "Brak adresu grafiki" }, { status: 400 })
  }
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "Nieprawidłowy rodzaj grafiki" }, { status: 400 })
  }

  let funeralHomeId: string | null = null
  if (session.role === "funeral-home") {
    funeralHomeId = await getFuneralHomeId(session.email)
    if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const sortOrder = await nextSortOrder({ funeralHomeId, kind })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("enekrolog_assets")
    .insert({
      funeral_home_id: funeralHomeId,
      kind,
      name: name.trim(),
      url: url.trim(),
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// Bulk reorder: assigns sort_order = array index for each id, scoped to the caller's own
// editable assets (admin's global ones, or a funeral home's own uploads).
export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { order } = body
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Nieprawidłowa lista kolejności" }, { status: 400 })
  }

  let funeralHomeId: string | null = null
  if (session.role === "funeral-home") {
    funeralHomeId = await getFuneralHomeId(session.email)
    if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const supabase = createServerClient()
  const results = await Promise.all(
    order.map((id: string, index: number) => {
      let query = supabase.from("enekrolog_assets").update({ sort_order: index }).eq("id", id)
      query = funeralHomeId === null ? query.is("funeral_home_id", null) : query.eq("funeral_home_id", funeralHomeId)
      return query
    })
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
