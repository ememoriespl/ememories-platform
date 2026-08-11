"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, Pencil, Save, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type AssetKind = "cover" | "background"

export interface EnekrologAsset {
  id: string
  kind: AssetKind
  name: string
  url: string
  funeral_home_id: string | null
  is_default: boolean
  sort_order: number
}

/** Cover tiles are wide like the banner; background tiles are tall like a phone screen. */
const TILE_ASPECT: Record<AssetKind, string> = { cover: "16 / 6", background: "9 / 16" }
const GRID_COLS: Record<AssetKind, string> = { cover: "grid-cols-2", background: "grid-cols-4" }

/** Serverless request bodies cap out around 4.5 MB, so reject oversized files before uploading. */
const MAX_UPLOAD_MB = 4
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

/** Covers get cropped to the banner ratio; backgrounds are used as-is behind the whole screen. */
const UPLOAD_HINT: Record<AssetKind, string> = {
  cover: `JPG, PNG lub WEBP · min. 1600 × 600 px · kadr 16:6 · do ${MAX_UPLOAD_MB} MB`,
  background: `JPG, PNG lub WEBP · zalecane 1080 × 1920 px · 9:16 · do ${MAX_UPLOAD_MB} MB`,
}

/** Shared loader so both sections work off one request. */
export function useEnekrologAssets() {
  const [assets, setAssets] = useState<EnekrologAsset[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/enekrolog-assets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAssets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return { assets, setAssets, loaded }
}

/**
 * Picker for one kind of eNekrolog imagery: pick a saved template, upload your own, and —
 * for admins — save the current image as a template and manage the whole set.
 */
export function EnekrologAssetPicker({
  kind,
  assets,
  setAssets,
  value,
  onChange,
  onPickFile,
  uploading,
  isAdmin,
}: {
  kind: AssetKind
  assets: EnekrologAsset[]
  setAssets: React.Dispatch<React.SetStateAction<EnekrologAsset[]>>
  value: string | null
  onChange: (url: string | null) => void
  onPickFile: (file: File) => void
  uploading: boolean
  isAdmin: boolean
}) {
  const items = assets.filter((a) => a.kind === kind)
  const isCustom = !!value && !items.some((a) => a.url === value)

  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [manageOpen, setManageOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const renameOriginal = useRef<Record<string, string>>({})

  const canEdit = (a: EnekrologAsset) => isAdmin || a.funeral_home_id !== null

  async function saveAsTemplate() {
    const name = saveName.trim()
    if (!name || !value) return
    try {
      const res = await fetch("/api/enekrolog-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url: value, kind }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
      const created: EnekrologAsset = await res.json()
      setAssets((prev) => [...prev, created])
      setSaveOpen(false)
      setSaveName("")
      toast.success("Zapisano szablon")
    } catch (err) {
      toast.error(`Nie udało się zapisać: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
  }

  async function rename(id: string, name: string, original: string) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)))
    try {
      const res = await fetch(`/api/enekrolog-assets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
    } catch (err) {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, name: original } : a)))
      toast.error(`Nie udało się zmienić nazwy: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
  }

  async function toggleDefault(id: string, next: boolean) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, is_default: next } : a)))
    try {
      const res = await fetch(`/api/enekrolog-assets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: next }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
    } catch (err) {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, is_default: !next } : a)))
      toast.error(`Nie udało się zmienić: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
  }

  async function persistOrder(ordered: EnekrologAsset[]) {
    const order = ordered.filter(canEdit).map((a) => a.id)
    try {
      const res = await fetch("/api/enekrolog-assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
    } catch (err) {
      toast.error(`Nie udało się zapisać kolejności: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
  }

  async function remove(id: string) {
    const removed = assets.find((a) => a.id === id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
    setDeleteId(null)
    try {
      const res = await fetch(`/api/enekrolog-assets/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Błąd ${res.status}`)
      if (removed && value === removed.url) onChange(null)
    } catch (err) {
      if (removed) setAssets((prev) => [...prev, removed])
      toast.error(`Nie udało się usunąć: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    }
  }

  const tileClass = (selected: boolean) =>
    cn(
      "relative overflow-hidden rounded-lg border-2 transition-colors",
      selected ? "border-primary" : "border-border hover:border-muted-foreground"
    )

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-2", GRID_COLS[kind])}>
        {/* No image */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(tileClass(!value), "flex items-center justify-center bg-muted/30")}
          style={{ aspectRatio: TILE_ASPECT[kind] }}
        >
          <span className="text-[11px] font-medium text-muted-foreground">Brak</span>
        </button>

        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.url)}
            title={a.name}
            className={tileClass(value === a.url)}
            style={{ aspectRatio: TILE_ASPECT[kind] }}
          >
            <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1 py-0.5 text-[10px] text-white">
              {a.name}
            </span>
          </button>
        ))}

        {/* The obituary's own upload, when it isn't one of the templates */}
        {isCustom && (
          <div className={tileClass(true)} style={{ aspectRatio: TILE_ASPECT[kind] }}>
            <img src={value!} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1 py-0.5 text-[10px] text-white">
              Własne
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            "relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ""
              if (!f) return
              if (f.size > MAX_UPLOAD_BYTES) {
                toast.error(
                  `Plik waży ${(f.size / 1024 / 1024).toFixed(1)} MB — maksymalnie ${MAX_UPLOAD_MB} MB.`
                )
                return
              }
              onPickFile(f)
            }}
          />
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Wgrywanie…" : "Wgraj"}
        </label>

        {isAdmin && (
          <ButtonGroup>
            <Button
              type="button"
              color="secondary"
              size="icon"
              className="h-9 w-9"
              disabled={!isCustom}
              title="Zapisz jako szablon"
              onClick={() => {
                setSaveName("")
                setSaveOpen(true)
              }}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              color="secondary"
              size="icon"
              className="h-9 w-9"
              title="Zarządzaj"
              onClick={() => setManageOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        )}

        <p className="text-xs text-muted-foreground">{UPLOAD_HINT[kind]}</p>
      </div>

      {/* Save current image as a template */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zapisz jako szablon</DialogTitle>
            <DialogDescription>
              Nadaj nazwę. Grafiki oznaczone jako domyślne są dostępne wszystkim zakładom pogrzebowym.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nazwa</Label>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAsTemplate()
              }}
              placeholder={kind === "cover" ? "np. Róże" : "np. Chmury"}
            />
          </div>
          <DialogFooter>
            <Button color="tertiary" onClick={() => setSaveOpen(false)}>Anuluj</Button>
            <Button onClick={saveAsTemplate} disabled={!saveName.trim()}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage: rename, reorder, default, delete */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{kind === "cover" ? "Zarządzaj zdjęciami w tle" : "Zarządzaj tłami"}</DialogTitle>
            <DialogDescription>
              Zmień nazwę, przeciągnij za uchwyt, aby zmienić kolejność, lub usuń grafikę.
              {isAdmin && " Grafiki oznaczone jako domyślne są dostępne wszystkim zakładom pogrzebowym."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {items.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Brak zapisanych grafik.</p>
            )}
            {items.map((a) => {
              const editable = canEdit(a)
              return (
                <div
                  key={a.id}
                  draggable={editable}
                  onDragStart={() => editable && setDraggedId(a.id)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (!draggedId || draggedId === a.id) return
                    const from = assets.findIndex((x) => x.id === draggedId)
                    const to = assets.findIndex((x) => x.id === a.id)
                    if (from === -1 || to === -1 || from === to) return
                    const reordered = [...assets]
                    const [moved] = reordered.splice(from, 1)
                    reordered.splice(to, 0, moved)
                    setAssets(reordered)
                  }}
                  onDrop={(e) => e.preventDefault()}
                  onDragEnd={() => {
                    setDraggedId(null)
                    persistOrder(assets)
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border bg-muted/30 p-2 transition-opacity",
                    editable && "cursor-grab active:cursor-grabbing",
                    draggedId === a.id && "opacity-40"
                  )}
                >
                  {editable ? (
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <img
                    src={a.url}
                    alt=""
                    className="h-9 w-14 shrink-0 rounded object-cover"
                    style={{ aspectRatio: TILE_ASPECT[kind] }}
                  />
                  <Input
                    value={a.name}
                    disabled={!editable}
                    className="h-9"
                    onFocus={() => {
                      renameOriginal.current[a.id] = a.name
                    }}
                    onChange={(e) => {
                      const v = e.target.value
                      setAssets((prev) => prev.map((x) => (x.id === a.id ? { ...x, name: v } : x)))
                    }}
                    onBlur={(e) => {
                      const original = renameOriginal.current[a.id]
                      const v = e.target.value.trim()
                      if (!editable || !v || v === original) return
                      rename(a.id, v, original)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur()
                    }}
                  />
                  {isAdmin && a.funeral_home_id === null && (
                    <label className="flex shrink-0 items-center gap-1.5 px-1 text-xs text-muted-foreground">
                      <Checkbox checked={a.is_default} onCheckedChange={(c) => toggleDefault(a.id, !!c)} />
                      Domyślna
                    </label>
                  )}
                  <Button
                    type="button"
                    color="secondary"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={!editable}
                    onClick={() => setDeleteId(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setManageOpen(false)}>Zamknij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć grafikę?</AlertDialogTitle>
            <AlertDialogDescription>
              Zniknie z listy do wyboru. Nekrologi, które już jej używają, zachowają swój wygląd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction color="error" onClick={() => deleteId && remove(deleteId)}>
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
