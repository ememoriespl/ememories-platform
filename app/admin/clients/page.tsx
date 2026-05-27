"use client"

import { useState } from "react"
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
  KeyRound,
  Trash2,
  CheckCircle2,
  PauseCircle,
  X,
} from "lucide-react"
import { mockFuneralHomes } from "@/lib/mock-data"
import { FuneralHome, FuneralHomeStatus } from "@/lib/types"
import { toast } from "sonner"

const statusLabel: Record<FuneralHomeStatus, string> = {
  active: "Aktywny",
  inactive: "Nieaktywny",
  suspended: "Zawieszony",
}

const statusVariant: Record<
  FuneralHomeStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
}

export default function ClientsPage() {
  const [clients, setClients] = useState<FuneralHome[]>(mockFuneralHomes)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<FuneralHome | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", email: "", qrLimit: "50" })

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
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

  function clearSelection() {
    setSelected(new Set())
  }

  function handleBulkActivate() {
    setClients((prev) =>
      prev.map((c) => (selected.has(c.id) ? { ...c, status: "active" as FuneralHomeStatus } : c))
    )
    toast.success(`Aktywowano ${selectedCount} klientów`)
    clearSelection()
  }

  function handleBulkSuspend() {
    setClients((prev) =>
      prev.map((c) => (selected.has(c.id) ? { ...c, status: "suspended" as FuneralHomeStatus } : c))
    )
    toast.success(`Zawieszono ${selectedCount} klientów`)
    clearSelection()
  }

  function handleBulkDelete() {
    setClients((prev) => prev.filter((c) => !selected.has(c.id)))
    setBulkDeleteOpen(false)
    toast.success(`Usunięto ${selectedCount} klientów`)
    clearSelection()
  }

  function handleCreate() {
    if (!newClient.name || !newClient.email) return
    const client: FuneralHome = {
      id: String(Date.now()),
      name: newClient.name,
      email: newClient.email,
      phone: "",
      address: "",
      status: "active",
      qrLimit: parseInt(newClient.qrLimit) || 50,
      qrUsed: 0,
      createdAt: new Date().toISOString().split("T")[0],
      lastLoginAt: "",
    }
    setClients((prev) => [client, ...prev])
    setNewClient({ name: "", email: "", qrLimit: "50" })
    setCreateOpen(false)
    toast.success("Klient został utworzony")
  }

  function handleDeactivate(id: string) {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "inactive" as FuneralHomeStatus } : c
      )
    )
    setDeactivateTarget(null)
    toast.success("Klient został dezaktywowany")
  }

  function handleResetPassword(email: string) {
    toast.success(`Link do resetowania hasła wysłany do: ${email}`)
  }

  return (
    <>
      <Topbar title="Klienci" subtitle="Zarządzaj zakładami pogrzebowymi" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Szukaj klientów..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nowy klient
          </Button>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={handleBulkActivate}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aktywuj
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={handleBulkSuspend}
                  >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={clearSelection}
                  >
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
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected && !allSelected
                        }}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-input accent-foreground cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nazwa</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Limit QR</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Użycie</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utworzony</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((client) => {
                    const pct = Math.round((client.qrUsed / client.qrLimit) * 100)
                    const isSelected = selected.has(client.id)
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
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.phone || "—"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{client.qrUsed}</span>
                          <span className="text-muted-foreground"> / {client.qrLimit}</span>
                        </td>
                        <td className="px-4 py-3 w-36">
                          <div className="space-y-1">
                            <Progress value={pct} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground">{pct}%</p>
                          </div>
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
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edytuj
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResetPassword(client.email)}
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Resetuj hasło
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeactivateTarget(client)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Dezaktywuj
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
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
                onChange={(e) =>
                  setNewClient((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Adres e-mail</Label>
              <Input
                type="email"
                placeholder="biuro@zakład.pl"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Limit kodów QR</Label>
              <Input
                type="number"
                min="1"
                placeholder="50"
                value={newClient.qrLimit}
                onChange={(e) =>
                  setNewClient((p) => ({ ...p, qrLimit: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleCreate}>Utwórz klienta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation dialog */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dezaktywuj klienta?</AlertDialogTitle>
            <AlertDialogDescription>
              Klient {deactivateTarget?.name} straci dostęp do platformy. Dane
              nekrologów zostaną zachowane.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deactivateTarget && handleDeactivate(deactivateTarget.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Dezaktywuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation dialog */}
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
    </>
  )
}
