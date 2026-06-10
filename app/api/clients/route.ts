import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()
  const [{ data, error }, { data: obituaryCounts }] = await Promise.all([
    supabase.from("funeral_homes").select("*").order("created_at", { ascending: false }),
    supabase.from("obituaries").select("funeral_home_id"),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const countMap: Record<string, number> = {}
  for (const o of obituaryCounts ?? []) {
    countMap[o.funeral_home_id] = (countMap[o.funeral_home_id] ?? 0) + 1
  }

  const enriched = (data ?? []).map((fh) => ({
    ...fh,
    obituary_count: countMap[fh.id] ?? 0,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, phone, address, qr_limit } = body

  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("funeral_homes")
    .insert({ name, email, phone: phone ?? null, address: address ?? null, qr_limit: qr_limit ?? 50, status: "active", qr_used: 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
