"use client"

import { useState, useEffect } from "react"
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
  SelectValue,
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
import {
  Plus,
  Search,
  Eye,
  QrCode,
  MoreHorizontal,
  Pencil,
  Archive,
  ExternalLink,
} from "lucide-react"
import { ObituaryStatus } from "@/lib/types"
import { toast } from "sonner"

const statusLabel: Record<ObituaryStatus, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwalny",
}

const statusVariant: Record<ObituaryStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  published: "default",
  archived: "secondary",
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
}

export default function ObituariesPage() {
  const router = useRouter()
  const [obituaries, setObituaries] = useState<DbObituary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [archiveTarget, setArchiveTarget] = useState<DbObituary | null>(null)

  useEffect(() => {
    fetch("/api/obituaries")
      .then((r) => r.json())
      .then((d) => setObituaries(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Błąd pobierania nekrologów"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = obituaries.filter((o) => {
    const matchSearch =
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleArchive(id: string) {
    try {
      await fetch(`/api/obituaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      })
      setObituaries((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "archived" as ObituaryStatus } : o))
      )
      setArchiveTarget(null)
      toast.success("Nekrolog zarchiwizowany")
    } catch {
      toast.error("Błąd podczas archiwizacji")
    }
  }

  return (
    <>
      <Topbar title="Nekrologi" subtitle="Lista wszystkich nekrologów" />

      <div className="p-6 space-y-4">
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
            <SelectTrigger className="h-9 w-40">
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
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nowy nekrolog
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nekrologi</CardTitle>
            <CardDescription>{filtered.length} rekordów</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Zmarły/a</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data śmierci</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wyświetlenia</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dodany</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Link / QR</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Ładowanie...</td></tr>
                  ) : filtered.map((obit) => (
                    <tr key={obit.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {obit.first_name[0]}{obit.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{obit.first_name} {obit.last_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {obit.birth_date ? new Date(obit.birth_date).getFullYear() : "?"} — {obit.death_date ? new Date(obit.death_date).getFullYear() : "?"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[obit.status]}>
                          {statusLabel[obit.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {obit.death_date ? new Date(obit.death_date).toLocaleDateString("pl-PL") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {obit.status !== "draft" ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            {obit.views}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(obit.created_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-3">
                        {obit.status === "published" ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://ememoriespl.vercel.app/obituary/${obit.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                            <Link href={`/funeral-home/obituaries/${obit.id}/qr`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <QrCode className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/funeral-home/obituaries/${obit.id}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edytuj
                              </DropdownMenuItem>
                              {false && (
                                <DropdownMenuItem>
                                  <Link
                                    href="#"
                                    target="_blank"
                                    className="flex items-center gap-2 w-full"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Otwórz publiczny
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setArchiveTarget(obit)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archiwizuj
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiwizować nekrolog?</AlertDialogTitle>
            <AlertDialogDescription>
              Nekrolog zostanie przeniesiony do archiwum. Publiczny URL przestanie działać.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archiveTarget && handleArchive(archiveTarget.id)}
            >
              Archiwizuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
