import { Bug, CircleHelp, Lightbulb, type LucideIcon } from "lucide-react"
import type { TicketKind } from "@/lib/tickets"

/** Kept out of lib/tickets.ts so the API routes don't pull an icon library in with the types. */
export const TICKET_KIND_ICONS: Record<TicketKind, LucideIcon> = {
  bug: Bug,
  idea: Lightbulb,
  question: CircleHelp,
}
