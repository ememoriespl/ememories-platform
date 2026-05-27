"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  return (
    <>
      <Topbar title="Ustawienia" subtitle="Konfiguracja platformy eMemories" />

      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dane platformy</CardTitle>
            <CardDescription>Podstawowe informacje o platformie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa platformy</Label>
              <Input defaultValue="eMemories" />
            </div>
            <div className="space-y-2">
              <Label>E-mail kontaktowy</Label>
              <Input type="email" defaultValue="admin@ememories.pl" />
            </div>
            <div className="space-y-2">
              <Label>Domena publiczna</Label>
              <Input defaultValue="ememories.pl" />
            </div>
            <Button onClick={() => toast.success("Ustawienia zapisane")} size="sm">
              Zapisz zmiany
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domyślny limit QR</CardTitle>
            <CardDescription>Limit przydzielany nowym klientom przy rejestracji</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Domyślna liczba kodów QR</Label>
              <Input type="number" defaultValue="50" className="max-w-40" />
            </div>
            <Button onClick={() => toast.success("Limit zaktualizowany")} size="sm">
              Zapisz
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Powiadomienia e-mail</CardTitle>
            <CardDescription>Skonfiguruj kiedy system ma wysyłać powiadomienia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Nowy klient zarejestrowany",
              "Klient wykorzystał 80% limitu QR",
              "Klient przekroczył limit QR",
              "Nowy nekrolog opublikowany",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between py-1">
                <p className="text-sm">{item}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toast.success(`Powiadomienie zaktualizowane`)}
                >
                  Włączone
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Strefa niebezpieczna</CardTitle>
            <CardDescription>Operacje nieodwracalne — działaj ostrożnie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">Wyczyść dane testowe</p>
                <p className="text-xs text-muted-foreground">Usuwa wszystkie mockowe rekordy</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => toast.error("Operacja niedostępna w trybie demo")}>
                Wyczyść
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
