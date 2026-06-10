"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
      .then((d) => {
        if (Array.isArray(d)) {
          setAdminEmails(d)
        } else {
          toast.error(`Błąd API: ${d?.error ?? JSON.stringify(d)}`)
        }
      })
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
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
      </div>
    </>
  )
}
