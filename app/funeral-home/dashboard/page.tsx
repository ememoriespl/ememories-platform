"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, QrCode, MoreHorizontal, Pencil, Archive, ExternalLink, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTableState, SortHead, TablePagination } from "@/components/ui/data-table"
import { BookOpen, Eye as PhEye, PencilSimpleLine } from "@phosphor-icons/react"
import { ObituaryStatus } from "@/lib/types"
import { toast } from "sonner"

const statusLabel: Record<ObituaryStatus, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwalny",
}

const statusVariant: Record<ObituaryStatus, "success" | "gray" | "outline"> = {
  draft: "outline",
  published: "success",
  archived: "gray",
}

interface FhData {
  name: string
  qr_limit: number
  qr_used: number
  obituaries: { total: number; published: number; draft: number }
}

interface DbObituary {
  id: string
  first_name: string
  last_name: string
  birth_date: string
  death_date: string
  status: ObituaryStatus
  views: number
  created_at: string
  published_at: string | null
  photo_url: string | null
  photo_bw: boolean
}

export default function FhDashboardPage() {
  const router = useRouter()
  const [fh, setFh] = useState<FhData | null>(null)
  const [obituaries, setObituaries] = useState<DbObituary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [archiveTarget, setArchiveTarget] = useState<DbObituary | null>(null)
  const { sort, toggleSort, sortData, paginate, page, setPage } = useTableState(10)

  useEffect(() => {
    fetch("/api/funeral-home/me").then((r) => r.json()).then(setFh).catch(() => {})
    fetch("/api/obituaries")
      .then((r) => r.json())
      .then((d) => setObituaries(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Błąd pobierania nekrologów"))
      .finally(() => setLoading(false))
  }, [])

  const qrUsed = fh?.obituaries?.total ?? 0
  const qrLimit = fh?.qr_limit ?? 1
  const pct = Math.round((qrUsed / qrLimit) * 100)
  const published = fh?.obituaries?.published ?? 0
  const draft = fh?.obituaries?.draft ?? 0

  const filtered = obituaries.filter((o) => {
    const matchSearch = `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = sortData(filtered, (o, col) => {
    if (col === "name") return `${o.first_name} ${o.last_name}`
    if (col === "status") return o.status
    if (col === "death_date") return o.death_date ?? ""
    if (col === "views") return o.views
    if (col === "created") return o.created_at
    return ""
  })
  const { items: paged, ...pagination } = paginate(sorted)

  async function handleArchive(id: string) {
    try {
      await fetch(`/api/obituaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      })
      setObituaries((prev) => prev.map((o) => (o.id === id ? { ...o, status: "archived" as ObituaryStatus } : o)))
      setArchiveTarget(null)
      toast.success("Nekrolog zarchiwizowany")
    } catch {
      toast.error("Błąd podczas archiwizacji")
    }
  }

  async function handlePublish(id: string) {
    try {
      await fetch(`/api/obituaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      })
      setObituaries((prev) => prev.map((o) => (o.id === id ? { ...o, status: "published" as ObituaryStatus } : o)))
      toast.success("Nekrolog opublikowany")
    } catch {
      toast.error("Błąd podczas publikacji")
    }
  }

  return (
    <>
      <Topbar title="Nekrologi" subtitle={fh?.name ?? ""} />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]" style={{ backgroundColor: "color-mix(in oklch, var(--chart-1) 10%, transparent)" }}>
                  <BookOpen className="h-6 w-6" weight="duotone" style={{ color: "var(--chart-1)" }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Limit nekrologów</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{fh ? `${qrUsed} / ${qrLimit}` : "—"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{fh ? `Wykorzystane ${pct}%` : "ładowanie…"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]" style={{ backgroundColor: "color-mix(in oklch, var(--chart-2) 10%, transparent)" }}>
                  <PhEye className="h-6 w-6" weight="duotone" style={{ color: "var(--chart-2)" }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Opublikowane</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{fh ? published : "—"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">widoczne publicznie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]" style={{ backgroundColor: "color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
                  <PencilSimpleLine className="h-6 w-6 text-foreground" weight="duotone" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Szkice</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{fh ? draft : "—"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">czekają na publikację</p>
            </CardContent>
          </Card>
        </div>

        {/* Obituaries list */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-9"
                placeholder="Szukaj..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="!h-9 w-40">
                <span>{{ all: "Wszystkie", published: "Opublikowane", draft: "Szkice", archived: "Archiwalne" }[statusFilter] ?? "Wszystkie"}</span>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="published">Opublikowane</SelectItem>
                <SelectItem value="draft">Szkice</SelectItem>
                <SelectItem value="archived">Archiwalne</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Link href="/funeral-home/obituaries/new">
                <Button className="h-9 gap-2">
                  <Plus className="h-4 w-4" />
                  Nowy nekrolog
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base">Nekrologi</CardTitle>
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{filtered.length} rekordów</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <SortHead col="name" sort={sort} onSort={toggleSort}>Zmarły/a</SortHead>
                      <SortHead col="status" sort={sort} onSort={toggleSort}>Status</SortHead>
                      <SortHead col="death_date" sort={sort} onSort={toggleSort}>Data śmierci</SortHead>
                      <SortHead col="views" sort={sort} onSort={toggleSort}>Wyświetlenia</SortHead>
                      <SortHead col="created" sort={sort} onSort={toggleSort}>Dodany</SortHead>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">eNekrolog</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full shrink-0" /><div className="space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                          <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-7 w-7 rounded" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-7 w-7 ml-auto rounded-lg" /></td>
                        </tr>
                      ))
                    ) : paged.map((obit) => (
                      <tr key={obit.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {obit.photo_url ? (
                              <img
                                src={obit.photo_url}
                                alt={`${obit.first_name} ${obit.last_name}`}
                                className={`h-8 w-8 shrink-0 rounded-full object-cover ${obit.photo_bw ? "grayscale" : ""}`}
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                {obit.first_name[0]}{obit.last_name[0]}
                              </div>
                            )}
                            <div>
                              <button onClick={() => router.push(`/funeral-home/obituaries/${obit.id}/edit`)} className="font-medium hover:underline text-left">
                                {obit.first_name} {obit.last_name}
                              </button>
                              <p className="text-xs text-muted-foreground">
                                {obit.birth_date ? new Date(obit.birth_date).getFullYear() : "?"} — {obit.death_date ? new Date(obit.death_date).getFullYear() : "?"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[obit.status]}>{statusLabel[obit.status]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {obit.death_date ? new Date(obit.death_date).toLocaleDateString("pl-PL") : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {obit.status !== "draft" ? obit.views : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(obit.created_at).toLocaleDateString("pl-PL")}
                        </td>
                        <td className="px-4 py-3">
                          {obit.status === "published" ? (
                            <a href={`https://ememoriespl.vercel.app/obituary/${obit.id}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/funeral-home/obituaries/${obit.id}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edytuj
                              </DropdownMenuItem>
                              {(obit.status === "draft" || obit.status === "archived") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePublish(obit.id)}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Opublikuj
                                  </DropdownMenuItem>
                                </>
                              )}
                              {obit.status !== "archived" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setArchiveTarget(obit)}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archiwizuj
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <p className="text-muted-foreground">Nie znaleziono nekrologów</p>
                          <Link href="/funeral-home/obituaries/new">
                            <Button size="sm" className="mt-3 gap-2">
                              <Plus className="h-4 w-4" />
                              Dodaj pierwszy nekrolog
                            </Button>
                          </Link>
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

      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiwizować nekrolog?</AlertDialogTitle>
            <AlertDialogDescription>
              Nekrolog zostanie przeniesiony do archiwum. Publiczny URL przestanie działać.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={() => archiveTarget && handleArchive(archiveTarget.id)}>
              Archiwizuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
