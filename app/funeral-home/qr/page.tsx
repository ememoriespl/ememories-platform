"use client"

import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, QrCode } from "lucide-react"
import { funeralHomeObituaries } from "@/lib/mock-data"

export default function FhQrPage() {
  const withQr = funeralHomeObituaries.filter((o) => o.qrCode)

  return (
    <>
      <Topbar title="Kody QR" subtitle="Zarządzaj kodami QR swoich nekrologów" />

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {withQr.length} kodów QR wygenerowanych
          </p>
        </div>

        {withQr.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Brak opublikowanych nekrologów z kodami QR</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withQr.map((obit) => (
              <Card key={obit.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">
                        {obit.firstName} {obit.lastName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        zm. {new Date(obit.deathDate).toLocaleDateString("pl-PL")}
                      </CardDescription>
                    </div>
                    <Badge variant={obit.status === "published" ? "default" : "secondary"}>
                      {obit.status === "published" ? "Aktywny" : "Archiwalny"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-xs font-mono text-muted-foreground">{obit.qrCode}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {obit.views}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/funeral-home/obituaries/${obit.id}/qr`} className="flex-1">
                      <Button color="secondary" size="sm" className="w-full gap-1.5 text-xs">
                        <QrCode className="h-3.5 w-3.5" />
                        Pobierz QR
                      </Button>
                    </Link>
                    <Link href={`/funeral-home/obituaries/${obit.id}/preview`} className="flex-1">
                      <Button color="tertiary" size="sm" className="w-full gap-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        Podgląd
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
