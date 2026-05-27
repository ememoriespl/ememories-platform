"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function FhSettingsPage() {
  return (
    <>
      <Topbar title="Ustawienia" subtitle="Ustawienia Twojego zakładu pogrzebowego" />

      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dane zakładu</CardTitle>
            <CardDescription>Informacje wyświetlane w systemie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa zakładu</Label>
              <Input defaultValue="Dom Pogrzebowy Ostatnia Droga" />
            </div>
            <div className="space-y-2">
              <Label>Adres e-mail</Label>
              <Input type="email" defaultValue="kontakt@ostatniadroga.pl" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input defaultValue="+48 12 987 65 43" />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input defaultValue="ul. Długa 45, 30-001 Kraków" />
            </div>
            <Button onClick={() => toast.success("Dane zapisane")} size="sm">
              Zapisz zmiany
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zmiana hasła</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Aktualne hasło</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Nowe hasło</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Potwierdź nowe hasło</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button onClick={() => toast.success("Hasło zmienione")} size="sm">
              Zmień hasło
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Powiadomienia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "E-mail po opublikowaniu nekrologu",
              "E-mail gdy QR zostanie zeskanowany 100 razy",
              "Powiadomienie o zbliżającym się limicie QR",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between py-1">
                <p className="text-sm">{item}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toast.success("Ustawienie zaktualizowane")}
                >
                  Włączone
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
