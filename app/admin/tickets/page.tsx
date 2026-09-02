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
import { useTableState, SortHead, TablePagination } from "@/components/ui/data-table"
import { StatusFilter, usePersistedFilter, matchesFilter } from "@/components/status-filter"
import {
  TICKET_KIND_META,
  TICKET_STATUSES,
  TICKET_STATUS_META,
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const { sort, toggleSort, sortData, paginate, setPage } = useTableState()

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTickets(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Nie udało się pobrać zgłoszeń"))
      .finally(() => setLoading(false))
  }, [])

  async function setStatus(id: string, status: TicketStatus) {
    const previous = tickets
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`Błąd ${res.status}`)
    } catch (err) {
      setTickets(previous)
      toast.error(`Nie udało się zmienić statusu: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
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

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Szukaj…"
                className="pl-9"
              />
            </div>
            <StatusFilter
              options={STATUS_OPTIONS}
              value={statusFilter}
              setValue={setStatusFilter}
              onChanged={() => setPage(1)}
            />
          </div>

          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <CardTitle>Zgłoszenia</CardTitle>
              <Badge variant="outline">{filtered.length} rekordów</Badge>
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
                        <tr key={t.id} className="align-top transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setExpanded((prev) => (prev === t.id ? null : t.id))}
                              className="text-left font-medium hover:underline"
                            >
                              {t.title}
                            </button>
                            <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
                            {expanded === t.id && (
                              <div className="mt-2 max-w-xl space-y-2 rounded-lg border bg-muted/20 p-3">
                                <p className="whitespace-pre-wrap text-sm">{t.body}</p>
                                <p className="text-xs text-muted-foreground">{t.email}</p>
                                {t.attachments && t.attachments.length > 0 && (
                                  <ul className="space-y-1">
                                    {t.attachments.map((url) => (
                                      <li key={url}>
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                        >
                                          <Paperclip className="h-3 w-3" />
                                          Załącznik
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {t.context && (
                                  <dl className="space-y-0.5 border-t pt-2 text-xs text-muted-foreground">
                                    {Object.entries(t.context).map(([k, v]) => (
                                      <div key={k} className="flex gap-2">
                                        <dt className="w-24 shrink-0">{k}</dt>
                                        <dd className="min-w-0 break-words">
                                          {Array.isArray(v) ? (v.length ? v.join(" · ") : "brak") : String(v)}
                                        </dd>
                                      </div>
                                    ))}
                                  </dl>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {TICKET_KIND_META[t.kind as TicketKind]?.emoji}{" "}
                            {TICKET_KIND_META[t.kind as TicketKind]?.label ?? t.kind}
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
                                  <DropdownMenuItem key={s} onClick={() => setStatus(t.id, s)}>
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
    </>
  )
}
