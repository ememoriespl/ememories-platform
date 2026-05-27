"use client"

import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  QrCode,
  CheckCircle,
  FileText,
  Plus,
  Eye,
  TrendingUp,
} from "lucide-react"
import { mockFuneralHomeMetrics, funeralHomeObituaries } from "@/lib/mock-data"

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

export default function FhDashboardPage() {
  const m = mockFuneralHomeMetrics
  const usedQr = 50 - m.remainingQr
  const pct = Math.round((usedQr / 50) * 100)

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Dom Pogrzebowy Ostatnia Droga"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Wszystkie nekrologi</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.totalObituaries}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+2</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Pozostałe QR</CardDescription>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.remainingQr}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={pct} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{pct}% limitu wykorzystano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Opublikowane</CardDescription>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.publishedObituaries}</CardTitle>
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
              <CardTitle className="text-2xl">{m.draftObituaries}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">czekają na publikację</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions + recent */}
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
              <div className="divide-y">
                {funeralHomeObituaries.map((obit) => (
                  <div key={obit.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {obit.firstName[0]}{obit.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {obit.firstName} {obit.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ur. {new Date(obit.birthDate).toLocaleDateString("pl-PL")} ·{" "}
                        zm. {new Date(obit.deathDate).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {obit.status === "published" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {obit.views}
                        </span>
                      )}
                      <Badge variant={statusVariant[obit.status]}>
                        {statusLabel[obit.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
                <Link href="/funeral-home/qr" className="block">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <QrCode className="h-4 w-4" />
                    Kody QR
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Limit QR</CardTitle>
                <CardDescription>Stan na dziś</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pozostałe</span>
                  <span className="font-semibold">{m.remainingQr} / 50</span>
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
