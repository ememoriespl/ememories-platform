"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Paperclip } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useTableState, SortHead, TablePagination } from "@/components/ui/data-table"
import { StatusFilter, usePersistedFilter, matchesFilter } from "@/components/status-filter"
import {
  TICKET_KIND_META,
  TICKET_STATUSES,
  TICKET_STATUS_META,
  statusNeedsNote,
  type Ticket,
  type TicketKind,
  type TicketStatus,
} from "@/lib/tickets"
import { toast } from "sonner"

const STATUS_OPTIONS = TICKET_STATUSES.map((s) => ({ value: s, label: TICKET_STATUS_META[s].label }))

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = usePersistedFilter<TicketStatus>(
    "admin-tickets-status-filter",
    TICKET_STATUSES
  )
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null)
  // Resolving or closing owes the reporter a reason, so it goes through this prompt.
  const [pendingNote, setPendingNote] = useState<{ id: string; status: TicketStatus } | null>(null)
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const { sort, toggleSort, sortData, paginate, setPage } = useTableState()

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTickets(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Nie udało się pobrać zgłoszeń"))
      .finally(() => setLoading(false))
  }, [])

  function requestStatus(id: string, status: TicketStatus) {
    if (statusNeedsNote(status)) {
      setNote("")
      setPendingNote({ id, status })
      return
    }
    void applyStatus(id, status)
  }

  async function applyStatus(id: string, status: TicketStatus, noteText?: string) {
    const previous = tickets
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, resolution_note: noteText ?? t.resolution_note } : t))
    )
    setOpenTicket((prev) =>
      prev && prev.id === id ? { ...prev, status, resolution_note: noteText ?? prev.resolution_note } : prev
    )
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: noteText }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
      return true
    } catch (err) {
      setTickets(previous)
      toast.error(`Nie udało się zmienić statusu: ${err instanceof Error ? err.message : "nieznany błąd"}`)
      return false
    }
  }

  async function confirmNote() {
    if (!pendingNote || !note.trim()) return
    setSavingNote(true)
    const ok = await applyStatus(pendingNote.id, pendingNote.status, note.trim())
    setSavingNote(false)
    if (ok) setPendingNote(null)
  }

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase()
    const haystack = `${t.reference} ${t.title} ${t.body} ${t.email} ${t.funeral_homes?.name ?? ""}`.toLowerCase()
    return haystack.includes(q) && matchesFilter(statusFilter, t.status)
  })

  const sorted = sortData(filtered, (row, col) => {
    if (col === "client") return row.funeral_homes?.name ?? ""
    if (col === "kind") return TICKET_KIND_META[row.kind as TicketKind]?.label ?? row.kind
    if (col === "status") return TICKET_STATUS_META[row.status]?.label ?? row.status
    if (col === "created") return row.created_at
    return row.title
  })

  const pagination = paginate(sorted)

  return (
    <>
      <Topbar title="Zgłoszenia" subtitle="Zgłoszenia od zakładów pogrzebowych" />

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-9"
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <StatusFilter
            options={STATUS_OPTIONS}
            value={statusFilter}
            setValue={setStatusFilter}
            onChanged={() => setPage(1)}
          />
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base">Zgłoszenia</CardTitle>
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {filtered.length} rekordów
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <SortHead col="reference" sort={sort} onSort={toggleSort}>Zgłoszenie</SortHead>
                      <SortHead col="kind" sort={sort} onSort={toggleSort}>Rodzaj</SortHead>
                      <SortHead col="client" sort={sort} onSort={toggleSort}>Klient</SortHead>
                      <SortHead col="status" sort={sort} onSort={toggleSort}>Status</SortHead>
                      <SortHead col="created" sort={sort} onSort={toggleSort}>Zgłoszono</SortHead>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      pagination.items.map((t) => (
                        <tr key={t.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setOpenTicket(t)}
                              className="text-left font-medium hover:underline"
                            >
                              {t.title}
                            </button>
                            <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {/* Outline rather than a colour of its own: the status pill beside it
                                carries the colour, and two coloured pills per row compete. */}
                            <Badge variant="outline">
                              {TICKET_KIND_META[t.kind as TicketKind]?.label ?? t.kind}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{t.funeral_homes?.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant={TICKET_STATUS_META[t.status]?.variant ?? "gray"}>
                              {TICKET_STATUS_META[t.status]?.label ?? t.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString("pl-PL")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg outline-none transition-colors hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {TICKET_STATUSES.map((s) => (
                                  <DropdownMenuItem key={s} onClick={() => requestStatus(t.id, s)}>
                                    {TICKET_STATUS_META[s].label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          Nie znaleziono zgłoszeń
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <TablePagination {...pagination} onPage={setPage} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* The whole ticket, in the same right-hand drawer the reporter wrote it in. */}
      <Sheet open={!!openTicket} onOpenChange={(o) => !o && setOpenTicket(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b p-6">
            <SheetTitle>{openTicket?.title}</SheetTitle>
            <p className="font-mono text-xs text-muted-foreground">{openTicket?.reference}</p>
          </SheetHeader>

          {openTicket && (
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
                <dt className="text-muted-foreground">Rodzaj</dt>
                <dd>
                  <Badge variant="outline">
                    {TICKET_KIND_META[openTicket.kind as TicketKind]?.label ?? openTicket.kind}
                  </Badge>
                </dd>

                <dt className="text-muted-foreground">Klient</dt>
                <dd>{openTicket.funeral_homes?.name ?? "—"}</dd>

                <dt className="text-muted-foreground">E-mail</dt>
                <dd className="min-w-0 break-words">
                  <a href={`mailto:${openTicket.email}`} className="text-primary hover:underline">
                    {openTicket.email}
                  </a>
                </dd>

                <dt className="text-muted-foreground">Zgłoszono</dt>
                <dd>{new Date(openTicket.created_at).toLocaleString("pl-PL")}</dd>

                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Select
                    value={openTicket.status}
                    onValueChange={(v) => {
                      requestStatus(openTicket.id, v as TicketStatus)
                    }}
                  >
                    <SelectTrigger className="!h-8 w-44">
                      <span>{TICKET_STATUS_META[openTicket.status]?.label ?? openTicket.status}</span>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {TICKET_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {TICKET_STATUS_META[st].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </dd>
              </dl>

              <div className="space-y-2 border-t pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Treść
                </p>
                <p className="whitespace-pre-wrap text-sm">{openTicket.body}</p>
              </div>

              {openTicket.resolution_note && (
                <div className="space-y-2 border-t pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Notatka dla zgłaszającego
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{openTicket.resolution_note}</p>
                </div>
              )}

              {openTicket.attachments && openTicket.attachments.length > 0 && (
                <div className="space-y-2 border-t pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Załączniki
                  </p>
                  <ul className="space-y-1">
                    {openTicket.attachments.map((url, i) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Załącznik {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {openTicket.context && (
                <div className="space-y-2 border-t pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Dane techniczne
                  </p>
                  <dl className="space-y-1 text-xs text-muted-foreground">
                    {Object.entries(openTicket.context).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="w-24 shrink-0">{k}</dt>
                        <dd className="min-w-0 break-words">
                          {Array.isArray(v) ? (v.length ? v.join(" · ") : "brak") : String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!pendingNote} onOpenChange={(o) => !o && setPendingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingNote?.status === "closed" ? "Zamknij zgłoszenie" : "Oznacz jako rozwiązane"}
            </DialogTitle>
            <DialogDescription>
              Notatka trafi do zgłaszającego — zobaczy ją przy swoim zgłoszeniu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-note">Notatka</Label>
            <Textarea
              id="ticket-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Co zostało zrobione albo dlaczego zamykamy zgłoszenie."
            />
          </div>

          <DialogFooter>
            <Button color="tertiary" onClick={() => setPendingNote(null)}>
              Anuluj
            </Button>
            <Button onClick={confirmNote} disabled={!note.trim() || savingNote}>
              {savingNote ? "Zapisywanie…" : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
