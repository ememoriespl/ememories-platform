"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { mockFuneralHomeMetrics } from "@/lib/mock-data"
import { QrCode, BookOpen, CheckCircle, FileText } from "lucide-react"

export default function FhUsagePage() {
  const m = mockFuneralHomeMetrics
  const usedQr = 50 - m.remainingQr
  const pct = Math.round((usedQr / 50) * 100)

  return (
    <>
      <Topbar title="Użycie i limity" subtitle="Twoje aktualne zużycie zasobów" />

      <div className="p-6 space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Wszystkie nekrologi</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.totalObituaries}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Opublikowane</CardDescription>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.publishedObituaries}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Szkice</CardDescription>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{m.draftObituaries}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Kody QR użyte</CardDescription>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{usedQr}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limit kodów QR</CardTitle>
            <CardDescription>
              Zakupiony pakiet: <strong>50 kodów QR</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Użyte</span>
                <span className="font-semibold">{usedQr} / 50</span>
              </div>
              <Progress
                value={pct}
                className={`h-3 ${pct >= 80 ? "[&>div]:bg-amber-500" : pct >= 95 ? "[&>div]:bg-destructive" : ""}`}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {pct}% limitu wykorzystano
                </p>
                <Badge variant={pct >= 80 ? "secondary" : "outline"}>
                  {m.remainingQr} pozostałych
                </Badge>
              </div>
            </div>

            {pct >= 80 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800 font-medium">
                  Zbliżasz się do limitu
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Skontaktuj się z administratorem, aby zwiększyć limit kodów QR.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Twój plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {[
                { label: "Pakiet QR", value: "50 kodów" },
                { label: "Typ konta", value: "Zakład pogrzebowy" },
                { label: "Status konta", value: "Aktywne" },
                { label: "Kontakt do admina", value: "admin@enekrolog.pl" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
