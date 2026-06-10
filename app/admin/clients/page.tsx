"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/layout/topbar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  CheckCircle2,
  PauseCircle,
  X,
  LogIn,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { FuneralHome, FuneralHomeStatus } from "@/lib/types"
import { toast } from "sonner"

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—"
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("48")) {
    return `+48 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`
  }
  if (digits.length === 9) {
    return `+48 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`
  }
  return phone
}

const statusLabel: Record<FuneralHomeStatus, string> = {
  active: "Aktywny",
  inactive: "Nieaktywny",
  suspended: "Zawieszony",
}

const statusVariant: Record<FuneralHomeStatus, "success" | "gray" | "error"> = {
  active: "success",
  inactive: "gray",
  suspended: "error",
}

type DbClient = {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  status: FuneralHomeStatus
  qr_limit: number
  qr_used: number
  obituary_count: number
  created_at: string
  last_login_at: string | null
}

function dbToClient(r: DbClient): FuneralHome & { obituaryCount: number } {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    address: r.address ?? "",
    status: r.status,
    qrLimit: r.qr_limit,
    qrUsed: r.qr_used,
    obituaryCount: r.obituary_count ?? 0,
    createdAt: r.created_at.split("T")[0],
    lastLoginAt: r.last_login_at ?? "",
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<(FuneralHome & { obituaryCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "", qrLimit: "50" })
  const [creating, setCreating] = useState(false)

  const [editTarget, setEditTarget] = useState<FuneralHome | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "", qrLimit: "50" })
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<FuneralHome | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [viewTarget, setViewTarget] = useState<FuneralHome | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/clients")
      if (!res.ok) throw new Error("Błąd pobierania danych")
      const data: DbClient[] = await res.json()
      setClients(data.map(dbToClient))
    } catch {
      toast.error("Nie udało się pobrać listy klientów")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const filtered = clients.filter(
    (c) =>
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || c.status === statusFilter)
  )

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id))
  const someSelected = filtered.some((c) => selected.has(c.id))
  const selectedCount = filtered.filter((c) => selected.has(c.id)).length

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.delete(c.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.add(c.id))
        return next
      })
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() { setSelected(new Set()) }

  async function patchClient(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error("Błąd aktualizacji")
    return (await res.json()) as DbClient
  }

  async function handleBulkActivate() {
    try {
      await Promise.all([...selected].map((id) => patchClient(id, { status: "active" })))
      setClients((prev) =>
        prev.map((c) => (selected.has(c.id) ? { ...c, status: "active" as FuneralHomeStatus } : c))
      )
      toast.success(`Aktywowano ${selectedCount} klientów`)
      clearSelection()
    } catch { toast.error("Błąd podczas aktywacji") }
  }

  async function handleBulkSuspend() {
    try {
      await Promise.all([...selected].map((id) => patchClient(id, { status: "suspended" })))
      setClients((prev) =>
        prev.map((c) => (selected.has(c.id) ? { ...c, status: "suspended" as FuneralHomeStatus } : c))
      )
      toast.success(`Zawieszono ${selectedCount} klientów`)
      clearSelection()
    } catch { toast.error("Błąd podczas zawieszania") }
  }

  async function handleBulkDelete() {
    try {
      await Promise.all(
        [...selected].map((id) =>
          fetch(`/api/clients/${id}`, { method: "DELETE" })
        )
      )
      setClients((prev) => prev.filter((c) => !selected.has(c.id)))
      setBulkDeleteOpen(false)
      toast.success(`Usunięto ${selectedCount} klientów`)
      clearSelection()
    } catch { toast.error("Błąd podczas usuwania") }
  }

  async function handleCreate() {
    if (!newClient.name || !newClient.email) return
    setCreating(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone || null,
          address: newClient.address || null,
          qr_limit: parseInt(newClient.qrLimit) || 50,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Błąd tworzenia klienta")
      }
      const created: DbClient = await res.json()
      setClients((prev) => [dbToClient(created), ...prev])
      setNewClient({ name: "", email: "", phone: "", address: "", qrLimit: "50" })
      setCreateOpen(false)
      toast.success("Klient został utworzony")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Błąd tworzenia klienta")
    } finally {
      setCreating(false)
    }
  }

  function openEdit(client: FuneralHome) {
    setEditTarget(client)
    setEditForm({ name: client.name, email: client.email, phone: client.phone ?? "", address: client.address ?? "", qrLimit: String(client.qrLimit) })
  }

  async function handleEdit() {
    if (!editTarget || !editForm.name || !editForm.email) return
    setSaving(true)
    try {
      const updated = await patchClient(editTarget.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        address: editForm.address || null,
        qr_limit: parseInt(editForm.qrLimit) || editTarget.qrLimit,
      })
      setClients((prev) =>
        prev.map((c) => (c.id === editTarget.id ? { ...dbToClient(updated), obituaryCount: c.obituaryCount } : c))
      )
      setEditTarget(null)
      toast.success("Dane klienta zostały zaktualizowane")
    } catch { toast.error("Błąd podczas zapisywania") } finally { setSaving(false) }
  }

  async function handleToggleStatus(client: FuneralHome) {
    const newStatus: FuneralHomeStatus = client.status === "inactive" ? "active" : "inactive"
    try {
      await patchClient(client.id, { status: newStatus })
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
      )
      toast.success(
        newStatus === "active"
          ? `${client.name} — klient aktywowany`
          : `${client.name} — klient dezaktywowany`
      )
    } catch { toast.error("Błąd zmiany statusu") }
  }

  async function handleImpersonate(client: FuneralHome) {
    try {
      await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: client.email }),
      })
      window.location.href = "/funeral-home/dashboard"
    } catch {
      toast.error("Błąd podczas wchodzenia na konto")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await fetch(`/api/clients/${deleteTarget.id}`, { method: "DELETE" })
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success("Klient został usunięty")
    } catch { toast.error("Błąd podczas usuwania") }
  }

  return (
    <>
      <Topbar title="Klienci" subtitle="Zarządzaj zakładami pogrzebowymi" />

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-9"
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="!h-9 w-40">
              <span>{{ all: "Wszystkie", active: "Aktywny", inactive: "Nieaktywny", suspended: "Zawieszony" }[statusFilter] ?? "Wszystkie"}</span>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="active">Aktywny</SelectItem>
              <SelectItem value="inactive">Nieaktywny</SelectItem>
              <SelectItem value="suspended">Zawieszony</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button className="h-9 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nowy klient
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Wszyscy klienci</CardTitle>
                <CardDescription>{filtered.length} zakładów pogrzebowych</CardDescription>
              </div>

              {someSelected && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Zaznaczono: <strong>{selectedCount}</strong>
                  </span>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleBulkActivate}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aktywuj
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleBulkSuspend}>
                    <PauseCircle className="h-3.5 w-3.5" />
                    Zawieś
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Usuń
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearSelection}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-input accent-foreground cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nazwa</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nekrologi</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utworzony</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                        <td className="px-4 py-3"><div className="space-y-1.5"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-48" /></div></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-7 w-7 ml-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : filtered.map((client) => {
                    const pct = client.qrLimit > 0 ? Math.round((client.obituaryCount / client.qrLimit) * 100) : 0
                    const isSelected = selected.has(client.id)
                    const isInactive = client.status === "inactive"
                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-muted/20" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(client.id)}
                            className="h-4 w-4 rounded border-input accent-foreground cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <button
                              onClick={() => setViewTarget(client)}
                              className="font-medium hover:underline text-left"
                            >
                              {client.name}
                            </button>
                            <p className="text-xs text-muted-foreground">{client.address || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{client.obituaryCount}</span>
                          <span className="text-muted-foreground"> / {client.qrLimit}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[client.status]}>
                            {statusLabel[client.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString("pl-PL")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(client)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edytuj
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleStatus(client)}>
                                {isInactive ? (
                                  <><UserCheck className="mr-2 h-4 w-4" />Aktywuj</>
                                ) : (
                                  <><UserX className="mr-2 h-4 w-4" />Dezaktywuj</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(client)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Usuń
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                        Nie znaleziono klientów
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create client dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utwórz nowego klienta</DialogTitle>
            <DialogDescription>
              Wypełnij dane zakładu pogrzebowego. Po utworzeniu zostanie wysłany
              e-mail z danymi logowania.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa zakładu</Label>
              <Input
                placeholder="np. Dom Pogrzebowy Wieczność"
                value={newClient.name}
                onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres e-mail</Label>
              <Input
                type="email"
                placeholder="biuro@zakład.pl"
                value={newClient.email}
                onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                placeholder="+48 000 000 000"
                value={newClient.phone}
                onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input
                placeholder="ul. Przykładowa 1, 00-001 Miasto"
                value={newClient.address}
                onChange={(e) => setNewClient((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ilość nekrologów</Label>
              <Input
                type="number"
                min="1"
                placeholder="50"
                value={newClient.qrLimit}
                onChange={(e) => setNewClient((p) => ({ ...p, qrLimit: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Anuluj</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Tworzenie..." : "Utwórz klienta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit client dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj klienta</DialogTitle>
            <DialogDescription>Zmień dane zakładu pogrzebowego.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa zakładu</Label>
              <Input
                placeholder="np. Dom Pogrzebowy Wieczność"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres e-mail</Label>
              <Input
                type="email"
                placeholder="biuro@zakład.pl"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                placeholder="+48 000 000 000"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input
                placeholder="ul. Przykładowa 1, 00-001 Miasto"
                value={editForm.address}
                onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ilość nekrologów</Label>
              <Input
                type="number"
                min="1"
                value={editForm.qrLimit}
                onChange={(e) => setEditForm((p) => ({ ...p, qrLimit: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Anuluj</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń klienta?</AlertDialogTitle>
            <AlertDialogDescription>
              Klient <strong>{deleteTarget?.name}</strong> oraz wszystkie jego dane
              zostaną trwale usunięte. Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń {selectedCount} klientów?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Wszyscy zaznaczeni klienci oraz ich
              dane zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* View client dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewTarget?.name}</DialogTitle>
            <DialogDescription>Dane zakładu pogrzebowego</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Nazwa</span>
              <span className="font-medium">{viewTarget?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">E-mail</span>
              <span className="font-medium">{viewTarget?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Telefon</span>
              <span className="font-medium">{formatPhone(viewTarget?.phone)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Adres</span>
              <span className="font-medium text-right max-w-[60%]">{viewTarget?.address || "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Limit nekrologów</span>
              <span className="font-medium">{viewTarget?.qrLimit}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTarget(null)}>Zamknij</Button>
            <Button onClick={() => { openEdit(viewTarget!); setViewTarget(null) }}>Edytuj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
