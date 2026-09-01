import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import { DECLARATION_VERSION } from "@/lib/declaration"

async function getFuneralHome(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("funeral_homes")
    .select("id, name")
    .eq("email", email)
    .single()
  return data ?? null
}

/**
 * Whether the signed-in funeral home has accepted the current version of the declaration.
 * Administrators are not the declaring party, so nothing is required of them.
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role === "admin") {
    return NextResponse.json({ required: false, accepted: true, version: DECLARATION_VERSION })
  }

  const home = await getFuneralHome(session.email)
  if (!home) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("declaration_acceptances")
    .select("accepted_at")
    .eq("funeral_home_id", home.id)
    .eq("version", DECLARATION_VERSION)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    required: true,
    accepted: !!data,
    acceptedAt: data?.accepted_at ?? null,
    version: DECLARATION_VERSION,
    funeralHomeName: home.name ?? null,
  })
}

/** Records an acceptance. Re-accepting the same version simply adds another row. */
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "funeral-home") {
    return NextResponse.json({ error: "Oświadczenie składa zakład pogrzebowy" }, { status: 403 })
  }

  const home = await getFuneralHome(session.email)
  if (!home) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // First hop in x-forwarded-for is the client; the rest are proxies.
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("declaration_acceptances")
    .insert({
      funeral_home_id: home.id,
      email: session.email,
      version: DECLARATION_VERSION,
      ip,
      user_agent: req.headers.get("user-agent"),
    })
    .select("accepted_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accepted: true, acceptedAt: data.accepted_at, version: DECLARATION_VERSION }, { status: 201 })
}
