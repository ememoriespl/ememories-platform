// Support tickets raised by funeral homes from the drawer in their sidebar.
//
// The kind is the only thing the reporter classifies, and it decides which fields they see.
// Priority is deliberately not theirs to set — everyone picks "critical" — so triage happens
// on the admin side through status alone.

export type TicketKind = "bug" | "idea" | "question"
export type TicketStatus = "new" | "in_progress" | "resolved" | "closed"

export const TICKET_KINDS: TicketKind[] = ["bug", "idea", "question"]

export const TICKET_KIND_META: Record<TicketKind, { label: string; hint: string }> = {
  bug: { label: "Coś nie działa", hint: "Błąd, coś zachowuje się inaczej niż powinno" },
  idea: { label: "Mam pomysł", hint: "Propozycja zmiany lub nowej funkcji" },
  question: { label: "Pytanie / inne", hint: "Nie wiem, jak coś zrobić" },
}

export const TICKET_STATUSES: TicketStatus[] = ["new", "in_progress", "resolved", "closed"]

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { label: string; variant: "blue" | "warning" | "success" | "gray" }
> = {
  new: { label: "Nowe", variant: "blue" },
  in_progress: { label: "W trakcie", variant: "warning" },
  resolved: { label: "Rozwiązane", variant: "success" },
  closed: { label: "Zamknięte", variant: "gray" },
}

/** Browser and screen facts collected for the reporter, so they never have to describe them. */
export interface TicketContext {
  url?: string
  userAgent?: string
  screen?: string
  viewport?: string
  timezone?: string
  language?: string
  consoleErrors?: string[]
}

export interface Ticket {
  id: string
  reference: string
  funeral_home_id: string | null
  email: string
  kind: TicketKind
  title: string
  body: string
  status: TicketStatus
  attachments: string[] | null
  context: TicketContext | null
  created_at: string
  funeral_homes?: { name: string } | null
}

/** Short human-quotable id — what the reporter sees after sending and quotes back to us. */
export function ticketReference(): string {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ZG-${stamp}-${rand}`
}
