"use client"

import { useState } from "react"
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
import { funeralHomeObituaries } from "@/lib/mock-data"
import { Obituary, ObituaryStatus } from "@/lib/types"
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

export default function ObituariesPage() {
  const [obituaries, setObituaries] = useState<Obituary[]>(funeralHomeObituaries)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [archiveTarget, setArchiveTarget] = useState<Obituary | null>(null)

  const filtered = obituaries.filter((o) => {
    const matchSearch =
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.status === statusFilter
    return matchSearch && matchStatus
  })

  function handleArchive(id: string) {
    setObituaries((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "archived" as ObituaryStatus } : o))
    )
    setArchiveTarget(null)
    toast.success("Nekrolog zarchiwizowany")
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
              placeholder="Szukaj po imieniu i nazwisku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">QR</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wyświetlenia</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dodany</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((obit) => (
                    <tr key={obit.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {obit.firstName[0]}{obit.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{obit.firstName} {obit.lastName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(obit.birthDate).getFullYear()} — {new Date(obit.deathDate).getFullYear()}
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
                        {new Date(obit.deathDate).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-3">
                        {obit.qrCode ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {obit.qrCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
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
                        {new Date(obit.createdAt).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/funeral-home/obituaries/${obit.id}/preview`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {obit.status === "published" && (
                            <Link href={`/funeral-home/obituaries/${obit.id}/qr`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link
                                  href={`/funeral-home/obituaries/${obit.id}/preview`}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Eye className="h-4 w-4" />
                                  Podgląd
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edytuj
                              </DropdownMenuItem>
                              {obit.publicUrl && (
                                <DropdownMenuItem>
                                  <Link
                                    href={obit.publicUrl}
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
                  {filtered.length === 0 && (
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
