"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, Copy, ArrowLeft, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const BASE_URL = "https://ememoriespl.vercel.app"

interface Obituary {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  death_date: string | null
  obituary_text: string
  ceremony_info: string
  location: string
  photo_url: string | null
  photo_bw: boolean
  status: string
  views: number
  published_at: string | null
}

export default function QrPage() {
  const { id } = useParams<{ id: string }>()
  const [obit, setObit] = useState<Obituary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/obituaries/${id}`)
      .then((r) => r.json())
      .then(setObit)
      .catch(() => toast.error("Błąd pobierania danych"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-muted-foreground">Ładowanie...</div>

  if (!obit || obit.status !== "published") {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">
          {!obit ? "Nekrolog nie istnieje." : "Ten nekrolog nie jest jeszcze opublikowany."}
        </p>
        <Link href="/funeral-home/obituaries">
          <Button color="secondary">
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </Button>
        </Link>
      </div>
    )
  }

  const publicUrl = `${BASE_URL}/obituary/${obit.id}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(publicUrl)}`

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl).catch(() => {})
    toast.success("Link skopiowany do schowka")
  }

  function handlePrint() {
    window.print()
  }

  const fullName = `${obit.first_name} ${obit.last_name}`
  const dateRange = [obit.birth_date, obit.death_date]
    .filter(Boolean)
    .map((d) => new Date(d!).toLocaleDateString("pl-PL"))
    .join(" — ")

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: fixed; inset: 0;
            display: flex; align-items: center; justify-content: center;
            background: white;
          }
        }
      `}</style>

      <Topbar title="Kod QR" />

      <div className="p-6 space-y-4 max-w-lg">
        <div className="flex items-center gap-2">
          <Link href="/funeral-home/obituaries">
            <Button color="tertiary" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Nekrologi
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{fullName}</CardTitle>
            <CardDescription>
              {obit.published_at
                ? `Opublikowano: ${new Date(obit.published_at).toLocaleDateString("pl-PL")}`
                : "Opublikowany"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR code */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-8">
              <img
                src={qrImageUrl}
                alt="Kod QR"
                width={200}
                height={200}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground font-mono">{obit.id.slice(0, 8)}…</p>
            </div>

            <Separator />

            {/* Public URL */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Publiczny link nekrologu
              </p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <p className="flex-1 text-sm font-mono truncate text-muted-foreground">
                  {publicUrl}
                </p>
                <Button color="tertiary" size="icon" className="h-7 w-7 shrink-0" onClick={copyUrl}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Button color="tertiary" size="icon" className="h-7 w-7 shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={qrImageUrl} download={`qr-${obit.id}.png`} className="flex-1">
                <Button className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Pobierz QR (PNG)
                </Button>
              </a>
              <Button color="secondary" className="flex-1 gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Drukuj / PDF
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Wydrukuj i umieść na tablicy pogrzebowej. Bliscy mogą zeskanować kod, aby odwiedzić nekrolog.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-2xl font-semibold">{obit.views}</p>
                <p className="text-xs text-muted-foreground">wyświetlenia</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-center">
                <p className="text-2xl font-semibold">
                  {obit.published_at
                    ? Math.floor((Date.now() - new Date(obit.published_at).getTime()) / 86400000)
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">dni od publikacji</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print area — A4 layout */}
      <div id="print-area" className="hidden print:block">
        <div style={{
          width: "210mm", minHeight: "297mm", padding: "20mm",
          fontFamily: "Georgia, serif", color: "#1a1a1a",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "24px", background: "white"
        }}>
          <div style={{ textAlign: "center", borderBottom: "1px solid #e5e5e5", paddingBottom: "16px", width: "100%" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>eMemories</p>
            <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0 }}>{fullName}</h1>
            {dateRange && <p style={{ fontSize: "14px", color: "#666", marginTop: "6px" }}>{dateRange}</p>}
          </div>

          {obit.photo_url && (
            <img
              src={obit.photo_url}
              alt={fullName}
              style={{
                width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover",
                filter: obit.photo_bw ? "grayscale(100%)" : "none"
              }}
            />
          )}

          {obit.obituary_text && (
            <p style={{ fontSize: "13px", lineHeight: 1.8, textAlign: "center", maxWidth: "140mm" }}>
              {obit.obituary_text}
            </p>
          )}

          {(obit.ceremony_info || obit.location) && (
            <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "16px", width: "100%", textAlign: "center" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Ceremonia</p>
              {obit.ceremony_info && <p style={{ fontSize: "13px", marginBottom: "4px" }}>{obit.ceremony_info}</p>}
              {obit.location && <p style={{ fontSize: "12px", color: "#666" }}>{obit.location}</p>}
            </div>
          )}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img src={qrImageUrl} alt="QR" width={160} height={160} />
            <p style={{ fontSize: "11px", color: "#888", fontFamily: "monospace" }}>{publicUrl}</p>
          </div>
        </div>
      </div>
    </>
  )
}
