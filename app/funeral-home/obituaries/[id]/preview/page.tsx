"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { QrCode, Download, Share2, ArrowLeft, Monitor, Smartphone } from "lucide-react"
import { mockObituaries } from "@/lib/mock-data"
import { toast } from "sonner"

function ObituaryCard({ obit }: { obit: (typeof mockObituaries)[0] }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/30 px-8 pt-8 pb-6 text-center space-y-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold mx-auto ring-4 ring-background">
          {obit.firstName[0]}{obit.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {obit.firstName} {obit.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(obit.birthDate).toLocaleDateString("pl-PL")} —{" "}
            {new Date(obit.deathDate).toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        <p className="text-sm leading-relaxed text-foreground">{obit.obituaryText}</p>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ceremonia pożegnalna
          </p>
          <p className="text-sm">{obit.ceremonyInfo}</p>
          <p className="text-sm text-muted-foreground">{obit.location}</p>
        </div>

        {obit.qrCode && (
          <>
            <Separator />
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6">
              <div className="grid grid-cols-5 grid-rows-5 gap-0.5 p-2 bg-white rounded-lg">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-sm ${
                      [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18].includes(i)
                        ? "bg-foreground"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-mono text-muted-foreground">{obit.qrCode}</p>
              <p className="text-xs text-center text-muted-foreground">
                Zeskanuj, aby odwiedzić stronę nekrologu
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const obit = mockObituaries.find((o) => o.id === id)

  if (!obit) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Nekrolog nie został znaleziony</p>
        <Link href="/funeral-home/obituaries">
          <Button color="secondary" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Wróć do listy
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Topbar title="Podgląd nekrologu" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/funeral-home/obituaries">Nekrologi</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {obit.firstName} {obit.lastName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                obit.status === "published"
                  ? "default"
                  : obit.status === "draft"
                  ? "outline"
                  : "secondary"
              }
            >
              {obit.status === "published"
                ? "Opublikowany"
                : obit.status === "draft"
                ? "Szkic"
                : "Archiwalny"}
            </Badge>
            {obit.status === "published" && (
              <Button size="sm" color="secondary" onClick={() => toast.success("Link skopiowany!")}>
                <Share2 className="h-4 w-4" />
                Udostępnij
              </Button>
            )}
            {obit.qrCode && (
              <Link href={`/funeral-home/obituaries/${id}/qr`}>
                <Button size="sm" color="secondary">
                  <QrCode className="h-4 w-4" />
                  Kod QR
                </Button>
              </Link>
            )}
            <Button size="sm" onClick={() => toast.success("PDF wygenerowany (demo)")}>
              <Download className="h-4 w-4" />
              Eksportuj PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="desktop">
          <TabsList className="h-8">
            <TabsTrigger value="desktop" className="gap-1.5 text-xs">
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-1.5 text-xs">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="desktop" className="mt-4">
            <div className="max-w-xl">
              <ObituaryCard obit={obit} />
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="mt-4">
            <div className="mx-auto w-80 rounded-3xl border-4 border-foreground/20 overflow-hidden shadow-xl">
              <div className="h-6 bg-foreground/10 flex items-center justify-center">
                <div className="h-1 w-12 rounded-full bg-foreground/20" />
              </div>
              <div className="overflow-y-auto max-h-[600px] bg-background">
                <ObituaryCard obit={obit} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
