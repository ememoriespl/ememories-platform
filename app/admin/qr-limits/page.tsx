"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode, Pencil } from "lucide-react"
import { useTableState, SortHead } from "@/components/ui/data-table"
import { mockFuneralHomes } from "@/lib/mock-data"
import { FuneralHome } from "@/lib/types"
import { toast } from "sonner"

export default function QrLimitsPage() {
  const [clients, setClients] = useState<FuneralHome[]>(mockFuneralHomes)
  const [editTarget, setEditTarget] = useState<FuneralHome | null>(null)
  const [newLimit, setNewLimit] = useState("")
  const { sort, toggleSort, sortData } = useTableState()

  const totalLimit = clients.reduce((sum, c) => sum + c.qrLimit, 0)
  const totalUsed = clients.reduce((sum, c) => sum + c.qrUsed, 0)

  function handleSave() {
    if (!editTarget) return
    const limit = parseInt(newLimit)
    if (!limit || limit < 1) return
    setClients((prev) =>
      prev.map((c) => (c.id === editTarget.id ? { ...c, qrLimit: limit } : c))
    )
    toast.success(`Limit QR zaktualizowany dla: ${editTarget.name}`)
    setEditTarget(null)
    setNewLimit("")
  }

  return (
    <>
      <Topbar title="Limity QR" subtitle="Zarządzaj przydzielonymi limitami kodów QR" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Łączna pula QR</CardDescription>
              <CardTitle className="text-2xl">{totalLimit}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">przydzielonych wszystkim klientom</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Wykorzystane</CardDescription>
              <CardTitle className="text-2xl">{totalUsed}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalUsed / totalLimit) * 100)}% całej puli
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pozostałe</CardDescription>
              <CardTitle className="text-2xl">{totalLimit - totalUsed}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.round((totalUsed / totalLimit) * 100)} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Limity według klienta</CardTitle>
            </div>
            <CardDescription>Kliknij ikonę edycji, aby zmienić limit</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <SortHead col="name" sort={sort} onSort={toggleSort}>Zakład</SortHead>
                    <SortHead col="status" sort={sort} onSort={toggleSort}>Status</SortHead>
                    <SortHead col="used" sort={sort} onSort={toggleSort}>Użyte</SortHead>
                    <SortHead col="limit" sort={sort} onSort={toggleSort}>Limit</SortHead>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground w-48">Użycie</th>
                    <SortHead col="remaining" sort={sort} onSort={toggleSort}>Pozostałe</SortHead>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Edytuj</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortData(clients, (c, col) => {
                    if (col === "name") return c.name
                    if (col === "status") return c.status
                    if (col === "used") return c.qrUsed
                    if (col === "limit") return c.qrLimit
                    if (col === "remaining") return c.qrLimit - c.qrUsed
                    return ""
                  }).map((client) => {
                    const pct = Math.round((client.qrUsed / client.qrLimit) * 100)
                    const remaining = client.qrLimit - client.qrUsed
                    const isWarning = pct >= 80
                    return (
                      <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={client.status === "active" ? "success" : client.status === "suspended" ? "error" : "gray"}>
                            {client.status === "active" ? "Aktywny" : client.status === "inactive" ? "Nieaktywny" : "Zawieszony"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{client.qrUsed}</td>
                        <td className="px-4 py-3 text-muted-foreground">{client.qrLimit}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <Progress
                              value={pct}
                              className={`h-2 ${isWarning ? "[&>div]:bg-amber-500" : ""}`}
                            />
                            <p className="text-[10px] text-muted-foreground">
                              {pct}%
                              {isWarning && (
                                <span className="ml-1 text-amber-600 font-medium">— blisko limitu</span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={remaining === 0 ? "error" : "outline"}>
                            {remaining} szt.
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditTarget(client)
                              setNewLimit(String(client.qrLimit))
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj limit QR</DialogTitle>
            <DialogDescription>
              {editTarget?.name} — aktualny limit: {editTarget?.qrLimit} szt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nowy limit QR</Label>
            <Input
              type="number"
              min={editTarget?.qrUsed ?? 1}
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
            />
            {editTarget && parseInt(newLimit) < editTarget.qrUsed && (
              <p className="text-sm text-destructive">
                Limit nie może być niższy niż już użyte ({editTarget.qrUsed})
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              disabled={!!editTarget && parseInt(newLimit) < editTarget.qrUsed}
            >
              Zapisz limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
