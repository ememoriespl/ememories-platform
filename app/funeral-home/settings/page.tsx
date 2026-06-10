"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface FhData {
  name: string
  email: string
  phone: string | null
  address: string | null
  qr_limit: number
  qr_used: number
  obituaries: { total: number; published: number; draft: number }
}

export default function FhSettingsPage() {
  const [data, setData] = useState<FhData | null>(null)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/funeral-home/me")
      .then((r) => r.json())
      .then((d: FhData) => {
        setData(d)
        setPhone(d.phone ?? "")
        setAddress(d.address ?? "")
      })
      .catch(() => toast.error("Nie udało się pobrać danych"))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/funeral-home/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      })
      if (!res.ok) throw new Error()
      toast.success("Dane zapisane")
    } catch {
      toast.error("Błąd podczas zapisywania")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Topbar title="Ustawienia" subtitle="Ustawienia Twojego zakładu pogrzebowego" />

      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dane zakładu</CardTitle>
            <CardDescription>Nazwa i e-mail są zarządzane przez administratora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nazwa zakładu</Label>
              <Input value={data?.name ?? ""} disabled className="bg-muted/50 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Adres e-mail</Label>
              <Input value={data?.email ?? ""} disabled className="bg-muted/50 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                placeholder="+48 000 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input
                placeholder="ul. Przykładowa 1, 00-001 Miasto"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={saving || !data} size="sm">
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limit nekrologów</CardTitle>
            <CardDescription>Przydzielony przez administratora</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Wykorzystano{" "}
              <span className="font-semibold text-foreground">{data?.obituaries?.total ?? 0}</span>
              {" "}/{" "}
              <span className="font-semibold text-foreground">{data?.qr_limit ?? 0}</span>
              {" "}nekrologów
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
