"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Download, Printer, Copy, ArrowLeft } from "lucide-react"
import { mockObituaries } from "@/lib/mock-data"
import { toast } from "sonner"

export default function QrPage() {
  const { id } = useParams<{ id: string }>()
  const obit = mockObituaries.find((o) => o.id === id)

  if (!obit || !obit.qrCode) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">
          {!obit ? "Nekrolog nie istnieje." : "Ten nekrolog nie ma jeszcze kodu QR. Opublikuj go najpierw."}
        </p>
        <Link href="/funeral-home/obituaries">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </Button>
        </Link>
      </div>
    )
  }

  const publicUrl = `https://ememories.pl${obit.publicUrl}`

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    toast.success("Link skopiowany do schowka")
  }

  return (
    <>
      <Topbar title="Kod QR" />

      <div className="p-6 space-y-4 max-w-lg">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/funeral-home/obituaries">Nekrologi</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/funeral-home/obituaries/${id}/preview`}>
                {obit.firstName} {obit.lastName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Kod QR</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {obit.firstName} {obit.lastName}
            </CardTitle>
            <CardDescription>
              Wygenerowano: {obit.publishedAt
                ? new Date(obit.publishedAt).toLocaleDateString("pl-PL")
                : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR visual */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white p-8">
              <div className="grid grid-cols-7 grid-rows-7 gap-1">
                {Array.from({ length: 49 }).map((_, i) => {
                  const row = Math.floor(i / 7)
                  const col = i % 7
                  const isCorner =
                    (row < 3 && col < 3) ||
                    (row < 3 && col > 3) ||
                    (row > 3 && col < 3)
                  const isData = !isCorner && Math.random() > 0.5
                  return (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-sm ${
                        isCorner || (i % 11 === 0 || i % 7 === 3)
                          ? "bg-foreground"
                          : isData
                          ? "bg-foreground/80"
                          : "bg-transparent"
                      }`}
                    />
                  )
                })}
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {obit.qrCode}
              </Badge>
            </div>

            <Separator />

            {/* Public URL */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Publiczny adres URL
              </p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <p className="flex-1 text-sm font-mono truncate text-muted-foreground">
                  {publicUrl}
                </p>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyUrl}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="flex-1 gap-2" onClick={() => toast.success("Pobieranie PDF (demo)")}>
                <Download className="h-4 w-4" />
                Pobierz PDF
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.success("Drukowanie (demo)")}>
                <Printer className="h-4 w-4" />
                Drukuj
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Wydrukuj kod QR i umieść na tablicy pogrzebowej lub materiałach ceremonii.
              Bliscy mogą go zeskanować, aby odwiedzić cyfrowy nekrolog.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Statystyki wyświetleń</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-semibold">{obit.views}</p>
                  <p className="text-xs text-muted-foreground">łączne wyświetlenia</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-semibold">
                    {obit.publishedAt
                      ? Math.floor(
                          (Date.now() - new Date(obit.publishedAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">dni od publikacji</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
