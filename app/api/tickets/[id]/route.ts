import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import { TICKET_STATUSES, statusNeedsNote, type TicketStatus } from "@/lib/tickets"

/** Only the administrator moves a ticket along; the reporter just watches the status. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { status, note } = await req.json()
  if (!TICKET_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
  }

  const needsNote = statusNeedsNote(status as TicketStatus)
  if (needsNote && (typeof note !== "string" || !note.trim())) {
    return NextResponse.json({ error: "Dodaj notatkę dla zgłaszającego" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("tickets")
    .update({
      status: status as TicketStatus,
      ...(needsNote ? { resolution_note: (note as string).trim() } : {}),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
