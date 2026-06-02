"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  CheckCircle,
  FileText,
  Plus,
  Eye,
} from "lucide-react"

const statusLabel: Record<string, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwalny",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  published: "default",
  archived: "secondary",
}

interface FhData {
  name: string
  qr_limit: number
  qr_used: number
  obituaries: { total: number; published: number; draft: number }
}

interface RecentObituary {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  death_date: string | null
  status: string
  views: number
}

export default function FhDashboardPage() {
  const [fh, setFh] = useState<FhData | null>(null)
  const [recent, setRecent] = useState<RecentObituary[]>([])

  useEffect(() => {
    fetch("/api/funeral-home/me")
      .then((r) => r.json())
      .then(setFh)
      .catch(() => {})
    fetch("/api/obituaries")
      .then((r) => r.json())
      .then((d) => setRecent(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {})
  }, [])

  const qrUsed = fh?.qr_used ?? 0
  const qrLimit = fh?.qr_limit ?? 1
  const qrRemaining = qrLimit - qrUsed
  const pct = Math.round((qrUsed / qrLimit) * 100)
  const total = fh?.obituaries?.total ?? 0
  const published = fh?.obituaries?.published ?? 0
  const draft = fh?.obituaries?.draft ?? 0

  return (
    <>
      <Topbar title="Dashboard" subtitle={fh?.name ?? ""} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Nekrologi</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{fh ? total : "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">łącznie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Opublikowane</CardDescription>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{fh ? published : "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">widoczne publicznie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Szkice</CardDescription>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{fh ? draft : "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">czekają na publikację</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Ostatnie nekrologi</CardTitle>
                <CardDescription>Twoje ostatnio dodane nekrologi</CardDescription>
              </div>
              <Link href="/funeral-home/obituaries">
                <Button variant="outline" size="sm">Zobacz wszystkie</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Brak nekrologów. <Link href="/funeral-home/obituaries/new" className="text-primary underline">Dodaj pierwszy</Link>.
                </p>
              ) : (
                <div className="divide-y">
                  {recent.map((obit) => (
                    <div key={obit.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {obit.first_name[0]}{obit.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{obit.first_name} {obit.last_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {obit.birth_date ? new Date(obit.birth_date).toLocaleDateString("pl-PL") : "?"}{" · "}
                          zm. {obit.death_date ? new Date(obit.death_date).toLocaleDateString("pl-PL") : "?"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {obit.status === "published" && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {obit.views}
                          </span>
                        )}
                        <Badge variant={statusVariant[obit.status] as "default" | "secondary" | "outline"}>
                          {statusLabel[obit.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/funeral-home/obituaries/new" className="block">
                  <Button className="w-full gap-2" size="sm">
                    <Plus className="h-4 w-4" />
                    Nowy nekrolog
                  </Button>
                </Link>
                <Link href="/funeral-home/obituaries" className="block">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Lista nekrologów
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Limit nekrologów</CardTitle>
                <CardDescription>Stan na dziś</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pozostałe</span>
                  <span className="font-semibold">{fh ? `${qrRemaining} / ${qrLimit}` : "…"}</span>
                </div>
                <Progress value={pct} className={`h-2 ${pct >= 80 ? "[&>div]:bg-amber-500" : ""}`} />
                <p className="text-xs text-muted-foreground">
                  {pct >= 80
                    ? "Zbliżasz się do limitu. Skontaktuj się z administratorem."
                    : "Limit dostępny"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
