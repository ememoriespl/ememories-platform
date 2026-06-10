"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

interface AdminEmail {
  id: string
  email: string
  created_at: string
}

export default function AdminSettingsPage() {
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([])
  const [emailsLoading, setEmailsLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [addingEmail, setAddingEmail] = useState(false)

  useEffect(() => {
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then((d) => setAdminEmails(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Błąd pobierania administratorów"))
      .finally(() => setEmailsLoading(false))
  }, [])

  async function handleAddEmail() {
    if (!newEmail.trim()) return
    setAddingEmail(true)
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Błąd dodawania")
        return
      }
      const created = await res.json()
      setAdminEmails((prev) => [...prev, created])
      setNewEmail("")
      toast.success("Administrator dodany")
    } finally {
      setAddingEmail(false)
    }
  }

  async function handleDeleteEmail(id: string, email: string) {
    try {
      const res = await fetch("/api/admin/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        toast.error("Błąd usuwania")
        return
      }
      setAdminEmails((prev) => prev.filter((e) => e.id !== id))
      toast.success(`Usunięto ${email}`)
    } catch {
      toast.error("Błąd usuwania")
    }
  }

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
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-base">Administratorzy</CardTitle>
              <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {emailsLoading ? "…" : adminEmails.length}
              </span>
            </div>
            <CardDescription>Tylko te adresy e-mail mają dostęp do panelu admina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dodany</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {emailsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-7 w-7 ml-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : adminEmails.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        Brak administratorów
                      </td>
                    </tr>
                  ) : (
                    adminEmails.map((ae) => (
                      <tr key={ae.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{ae.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(ae.created_at).toLocaleDateString("pl-PL")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteEmail(ae.id, ae.email)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="nowy@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddEmail() }}
                className="h-9"
              />
              <Button
                size="sm"
                onClick={handleAddEmail}
                disabled={addingEmail || !newEmail.trim()}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Dodaj
              </Button>
            </div>
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
