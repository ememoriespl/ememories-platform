"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Eye, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type ObituaryStatus = "draft" | "published" | "archived"

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
}

export default function AdminObituariesPage() {
  const [obituaries, setObituaries] = useState<AdminObituary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Zakład</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data śmierci</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wyświetlenia</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dodany</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Link</th>
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
                          <a
                            href={`https://ememoriespl.vercel.app/obituary/${obit.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        Nie znaleziono nekrologów
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
