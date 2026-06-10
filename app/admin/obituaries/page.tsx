"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ExternalLink, MoreHorizontal, Trash2, X, Pencil } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTableState, SortHead, TablePagination } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

type ObituaryStatus = "draft" | "published" | "archived"

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

interface AdminObituary {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  death_date: string | null
  status: ObituaryStatus
  views: number
  created_at: string
  funeral_homes: { name: string } | null
  photo_url: string | null
  photo_bw: boolean
}

export default function AdminObituariesPage() {
  const router = useRouter()
  const [obituaries, setObituaries] = useState<AdminObituary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const { sort, toggleSort, sortData, paginate, page, setPage } = useTableState(10)

  useEffect(() => {
    fetch("/api/admin/obituaries")
      .then((r) => r.json())
      .then((d) => setObituaries(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Błąd pobierania nekrologów"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = obituaries.filter((o) => {
    const matchSearch =
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (o.funeral_homes?.name ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = sortData(filtered, (o, col) => {
    if (col === "name") return `${o.first_name} ${o.last_name}`
    if (col === "funeral_home") return o.funeral_homes?.name ?? ""
    if (col === "status") return o.status
    if (col === "death_date") return o.death_date ?? ""
    if (col === "views") return o.views
    if (col === "created") return o.created_at
    return ""
  })

  const { items: paged, ...pagination } = paginate(sorted)

  const allSelected = paged.length > 0 && paged.every((o) => selected.has(o.id))
  const someSelected = paged.some((o) => selected.has(o.id))
  const selectedCount = [...selected].length

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); paged.forEach((o) => n.delete(o.id)); return n })
    } else {
      setSelected((prev) => { const n = new Set(prev); paged.forEach((o) => n.add(o.id)); return n })
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleBulkDelete() {
    try {
      await Promise.all([...selected].map((id) =>
        fetch(`/api/admin/obituaries/${id}`, { method: "DELETE" })
      ))
      setObituaries((prev) => prev.filter((o) => !selected.has(o.id)))
      setSelected(new Set())
      setBulkDeleteOpen(false)
      toast.success(`Usunięto ${selectedCount} nekrologów`)
    } catch {
      toast.error("Błąd podczas usuwania")
    }
  }

  return (
    <>
      <Topbar title="Nekrologi" subtitle="Wszystkie nekrologi w systemie" />

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
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1) }}>
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
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base">Nekrologi</CardTitle>
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{filtered.length} rekordów</span>
              </div>
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Zaznaczono: <strong>{selectedCount}</strong></span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Usuń
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelected(new Set())}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 w-10">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <SortHead col="name" sort={sort} onSort={toggleSort}>Zmarły/a</SortHead>
                    <SortHead col="funeral_home" sort={sort} onSort={toggleSort}>Zakład</SortHead>
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
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full shrink-0" /><div className="space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-7 w-7 rounded" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-7 w-7 ml-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : paged.map((obit) => (
                    <tr
                      key={obit.id}
                      className={`hover:bg-muted/30 transition-colors ${selected.has(obit.id) ? "bg-muted/20" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(obit.id)}
                          onCheckedChange={() => toggleOne(obit.id)}
                        />
                      </td>
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
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {obit.funeral_homes?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[obit.status]}>
                          {statusLabel[obit.status]}
                        </Badge>
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
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => { setSelected(new Set([obit.id])); setBulkDeleteOpen(true) }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Usuń
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                        Nie znaleziono nekrologów
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={(o) => { if (!o) { setBulkDeleteOpen(false) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć {selectedCount} nekrolog{selectedCount === 1 ? "" : selectedCount < 5 ? "i" : "ów"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Publiczne URL-e przestaną działać.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setBulkDeleteOpen(false); setSelected(new Set()) }}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
