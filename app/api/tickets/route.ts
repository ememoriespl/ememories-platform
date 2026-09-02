import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import { TICKET_KINDS, ticketReference, type TicketKind } from "@/lib/tickets"

async function getFuneralHomeId(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase.from("funeral_homes").select("id").eq("email", email).single()
  return data?.id ?? null
}

/** Admins see every ticket; a funeral home sees only its own. */
export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()

  if (session.role === "admin") {
    const { data, error } = await supabase
      .from("tickets")
      .select("*, funeral_homes(name)")
      .order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json([])

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("funeral_home_id", funeralHomeId)
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
  const { kind, title, description, email, attachments, context } = body

  if (!TICKET_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Wybierz rodzaj zgłoszenia" }, { status: 400 })
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Opis w jednej linii jest wymagany" }, { status: 400 })
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Opis zgłoszenia jest wymagany" }, { status: 400 })
  }
  if (attachments !== undefined && (!Array.isArray(attachments) || attachments.some((a) => typeof a !== "string"))) {
    return NextResponse.json({ error: "Nieprawidłowe załączniki" }, { status: 400 })
  }

  const funeralHomeId =
    session.role === "funeral-home" ? await getFuneralHomeId(session.email) : null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      reference: ticketReference(),
      funeral_home_id: funeralHomeId,
      email: typeof email === "string" && email.trim() ? email.trim() : session.email,
      kind: kind as TicketKind,
      title: title.trim(),
      body: description.trim(),
      status: "new",
      attachments: attachments ?? [],
      context: context ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
