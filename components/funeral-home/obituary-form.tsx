"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  X,
  Send,
  Save,
  Download,
  Trash2,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import {
  ObituaryPreview,
  DEFAULT_PRINT_TEMPLATE,
  DEFAULT_BLOCK_ORDER,
  DEFAULT_GRAPHIC_ORDER,
  FRAME_STYLE_OPTIONS,
  renderFrame,
  type PrintTemplateSettings,
  type BlockSettings,
  type GraphicItemSettings,
  type FrameStyle,
  type BlockAlign,
  type VerticalAlign,
} from "@/components/funeral-home/obituary-preview"
import { PRINT_FONTS, PRINT_FONTS_CLASSNAME, getClosestWeight } from "@/lib/print-fonts"
import { PRINT_SIGILS, getSigilOption, DEFAULT_SIGIL_ID, DEFAULT_SIGIL_COLOR } from "@/lib/print-sigils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ColorPicker } from "@/components/ui/color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
import type { ContentBlockId, GraphicItemId } from "@/components/funeral-home/obituary-preview"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const BASE_URL = "https://ememoriespl.vercel.app"

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Normalna",
  500: "Medium",
  600: "Semi Bold",
  700: "Pogrubiona",
  800: "Extra Bold",
  900: "Black",
}

const BLOCK_LABELS: Record<ContentBlockId, string> = {
  photo: "Zdjęcie",
  sigil: "Sygnet",
  sp: "Ś.P.",
  name: "Imię i nazwisko",
  dates: "Data",
  headline: "Nagłówek",
  body: "Treść",
  ceremonyLabel: "Etykieta",
  ceremony: "Ceremonia",
  ceremonyBy: "Przygotowane przez",
}

const GRAPHIC_LABELS: Record<GraphicItemId, string> = {
  photo: "Zdjęcie",
  sigil: "Sygnet",
  qr: "Kod QR",
}

const ALIGN_OPTIONS: { id: BlockAlign; label: string; icon: LucideIcon }[] = [
  { id: "left", label: "Lewo", icon: AlignLeft },
  { id: "center", label: "Środek", icon: AlignCenter },
  { id: "right", label: "Prawo", icon: AlignRight },
]

const VALIGN_OPTIONS: { id: VerticalAlign; label: string; icon: LucideIcon }[] = [
  { id: "top", label: "Góra", icon: AlignVerticalJustifyStart },
  { id: "center", label: "Środek", icon: AlignVerticalJustifyCenter },
  { id: "bottom", label: "Dół", icon: AlignVerticalJustifyEnd },
]

function IconToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string; icon: LucideIcon }[]
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => {
        const Icon = o.icon
        return (
          <button
            key={o.id}
            type="button"
            title={o.label}
            onClick={() => onChange(o.id)}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
            className={cn(
              "rounded-md border-2 p-1.5 transition-colors",
              value === o.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        )
      })}
    </div>
  )
}

function CollapsibleSectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <Collapsible>
        <CollapsibleTrigger className="group/collapsible-trigger cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            <CardAction>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[panel-open]/collapsible-trigger:rotate-180" />
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <CardContent className="space-y-4 pt-4">{children}</CardContent>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  )
}

function SigilTile({ option, size = "h-4 w-4" }: { option: { kind: "text" | "image"; char?: string; src?: string; label: string }; size?: string }) {
  return option.kind === "text" ? (
    <span className="text-sm">{option.char}</span>
  ) : (
    <img src={option.src} alt={option.label} className={cn(size, "object-contain")} />
  )
}

function SigilPickerRow({
  sigilId,
  color,
  onSigilChange,
  onColorChange,
}: {
  sigilId: string
  color: string
  onSigilChange: (id: string) => void
  onColorChange: (hex: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = getSigilOption(sigilId)
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">Symbol</span>
      <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()} draggable={false}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            title={selected.label}
            className="flex h-7 items-center gap-1 rounded-md border-2 border-border px-1.5 transition-colors hover:border-muted-foreground"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden">
              <SigilTile option={selected} />
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            <div className="grid grid-cols-5 gap-1.5">
              {PRINT_SIGILS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  onClick={() => {
                    onSigilChange(s.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border-2 transition-colors",
                    sigilId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <SigilTile option={s} size="h-5 w-5" />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <ColorPicker value={color} onChange={onColorChange} />
      </div>
    </div>
  )
}

type TabId = "dane" | "szablon" | "enekrolog"

const TABS: { id: TabId; label: string }[] = [
  { id: "dane", label: "Dane" },
  { id: "szablon", label: "Szablon druku" },
  { id: "enekrolog", label: "eNekrolog" },
]

interface LocationEntry {
  enabled: boolean
  address: string
}

interface Locations {
  funeralHome: LocationEntry
  church: LocationEntry
  cemetery: LocationEntry
}

interface FormData {
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  obituaryHeadline: string
  obituaryText: string
  ceremonyInfo: string
  preparedByText: string
  ceremonyDate: string
  ceremonyTime: string
  locations: Locations
  photo: string | null
  photoBw: boolean
  status: string
  printTemplate: PrintTemplateSettings
}

function defaultLocations(fhAddress = ""): Locations {
  return {
    funeralHome: { enabled: true, address: fhAddress },
    church: { enabled: false, address: "" },
    cemetery: { enabled: false, address: "" },
  }
}

function reconcileOrder<T extends string>(saved: unknown, defaultOrder: readonly T[]): T[] {
  const savedOrder = Array.isArray(saved) ? saved.filter((id): id is T => (defaultOrder as readonly string[]).includes(id)) : []
  const result = [...savedOrder]
  for (const id of defaultOrder) {
    if (result.includes(id)) continue
    const defaultIdx = defaultOrder.indexOf(id)
    let insertAt = 0
    for (let i = defaultIdx - 1; i >= 0; i--) {
      const idx = result.indexOf(defaultOrder[i])
      if (idx !== -1) {
        insertAt = idx + 1
        break
      }
    }
    result.splice(insertAt, 0, id)
  }
  return result
}

function parsePrintTemplate(raw: unknown): PrintTemplateSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_PRINT_TEMPLATE
  const p = raw as Partial<PrintTemplateSettings> & {
    blocks?: Partial<Record<ContentBlockId, Partial<BlockSettings> & { displayMode?: "photo" | "sigil" }>>
    graphicItems?: Partial<Record<GraphicItemId, Partial<GraphicItemSettings>>>
    // legacy fields from earlier template versions, migrated below
    sigilId?: string
    sigilSize?: number
    qrSize?: number
    qr?: { align?: BlockAlign; marginTop?: number; marginBottom?: number }
  }
  const blocks = { ...DEFAULT_PRINT_TEMPLATE.blocks }
  for (const id of DEFAULT_BLOCK_ORDER) {
    const { displayMode: _displayMode, ...rest } = p.blocks?.[id] ?? {}
    blocks[id] = { ...DEFAULT_PRINT_TEMPLATE.blocks[id], ...rest }
  }
  const graphicItems = { ...DEFAULT_PRINT_TEMPLATE.graphicItems }
  for (const id of DEFAULT_GRAPHIC_ORDER) {
    graphicItems[id] = { ...DEFAULT_PRINT_TEMPLATE.graphicItems[id], ...p.graphicItems?.[id] }
  }
  if (p.sigilSize !== undefined) graphicItems.sigil = { ...graphicItems.sigil, size: p.sigilSize }
  if (p.qrSize !== undefined) graphicItems.qr = { ...graphicItems.qr, size: p.qrSize }
  if (p.qr) {
    graphicItems.qr = {
      ...graphicItems.qr,
      align: p.qr.align ?? graphicItems.qr.align,
      marginTop: p.qr.marginTop ?? graphicItems.qr.marginTop,
      marginBottom: p.qr.marginBottom ?? graphicItems.qr.marginBottom,
    }
  }
  // legacy: a single global sigilId used to seed the graphic column's sigil
  if (p.sigilId && !p.graphicItems?.sigil?.sigilId) {
    graphicItems.sigil = { ...graphicItems.sigil, sigilId: p.sigilId }
  }
  // legacy: the content-column "photo" block used to double as photo-or-sigil via displayMode
  const legacyPhoto = p.blocks?.photo
  if (legacyPhoto?.displayMode === "sigil" && !p.blocks?.sigil) {
    blocks.sigil = {
      ...blocks.sigil,
      enabled: true,
      size: legacyPhoto.size ?? blocks.sigil.size,
      align: legacyPhoto.align ?? blocks.sigil.align,
      marginTop: legacyPhoto.marginTop ?? blocks.sigil.marginTop,
      marginBottom: legacyPhoto.marginBottom ?? blocks.sigil.marginBottom,
      sigilId: p.sigilId ?? blocks.sigil.sigilId,
    }
    blocks.photo = { ...blocks.photo, enabled: false }
  }
  // legacy: frame styles from the procedural (pre-artwork) version of the frame picker
  const LEGACY_FRAME_STYLES: Record<string, FrameStyle> = {
    simple: "cienka-linia",
    double: "podwojna-linia",
    dashed: "cienka-linia",
    "classic-thick": "gruba-linia",
    "ornamental-corners": "rogi-ozdobne",
  }
  const frame = { ...DEFAULT_PRINT_TEMPLATE.frame, ...p.frame }
  if (frame.style in LEGACY_FRAME_STYLES) {
    frame.style = LEGACY_FRAME_STYLES[frame.style]
  }

  return {
    fontId: p.fontId ?? DEFAULT_PRINT_TEMPLATE.fontId,
    fontWeight: p.fontWeight ?? DEFAULT_PRINT_TEMPLATE.fontWeight,
    columnPosition: p.columnPosition ?? DEFAULT_PRINT_TEMPLATE.columnPosition,
    verticalAlign: p.verticalAlign ?? DEFAULT_PRINT_TEMPLATE.verticalAlign,
    pagePadding: p.pagePadding ?? DEFAULT_PRINT_TEMPLATE.pagePadding,
    columnGap: p.columnGap ?? DEFAULT_PRINT_TEMPLATE.columnGap,
    frame,
    blockOrder: reconcileOrder(p.blockOrder, DEFAULT_BLOCK_ORDER),
    blocks,
    graphicOrder: reconcileOrder(p.graphicOrder, DEFAULT_GRAPHIC_ORDER),
    graphicItems,
  }
}

function parseLocationJSON(
  raw: string,
  fhAddress: string
): Pick<FormData, "locations" | "obituaryHeadline" | "preparedByText" | "ceremonyDate" | "ceremonyTime" | "printTemplate"> {
  try {
    const parsed = JSON.parse(raw)
    const locations: Locations = {
      funeralHome: parsed.funeralHome ?? { enabled: true, address: fhAddress },
      church: parsed.church ?? { enabled: false, address: "" },
      cemetery: parsed.cemetery ?? { enabled: false, address: "" },
    }
    return {
      locations,
      obituaryHeadline: parsed.obituaryHeadline ?? "",
      preparedByText: parsed.preparedByText ?? "",
      ceremonyDate: parsed.ceremonyDate ?? "",
      ceremonyTime: parsed.ceremonyTime ?? "",
      printTemplate: parsePrintTemplate(parsed.printTemplate),
    }
  } catch {
    return {
      locations: defaultLocations(fhAddress),
      obituaryHeadline: "",
      preparedByText: "",
      ceremonyDate: "",
      ceremonyTime: "",
      printTemplate: DEFAULT_PRINT_TEMPLATE,
    }
  }
}

function serializeLocation(data: FormData): string {
  return JSON.stringify({
    v: 5,
    obituaryHeadline: data.obituaryHeadline,
    preparedByText: data.preparedByText,
    ceremonyDate: data.ceremonyDate,
    ceremonyTime: data.ceremonyTime,
    funeralHome: data.locations.funeralHome,
    church: data.locations.church,
    cemetery: data.locations.cemetery,
    printTemplate: data.printTemplate,
  })
}

export interface ObituaryRaw {
  first_name?: string
  last_name?: string
  birth_date?: string
  death_date?: string
  obituary_text?: string
  ceremony_info?: string
  location?: string
  photo_url?: string | null
  photo_bw?: boolean
  status?: string
  funeral_homes?: { name: string; address: string; phone: string } | null
}

interface SavedPrintTemplate {
  id: string
  name: string
  template: unknown
  funeral_home_id: string | null
}

export interface ObituaryFormProps {
  mode: "new" | "edit"
  obituaryId?: string
  initialRaw?: ObituaryRaw
  fhAddress?: string
  fhName?: string
  fhPhone?: string
  backUrl?: string
  isAdmin?: boolean
}

export function ObituaryForm({
  mode,
  obituaryId,
  initialRaw,
  fhAddress = "",
  fhName = "",
  fhPhone = "",
  backUrl = "/funeral-home/dashboard",
  isAdmin = false,
}: ObituaryFormProps) {
  const router = useRouter()
  const [recordId, setRecordId] = useState(obituaryId)
  const [templates, setTemplates] = useState<SavedPrintTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [deletingTemplate, setDeletingTemplate] = useState(false)
  const [deleteTemplateConfirmOpen, setDeleteTemplateConfirmOpen] = useState(false)
  useEffect(() => {
    fetch("/api/print-templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setTemplates(Array.isArray(rows) ? rows : []))
      .catch(() => {})
  }, [])
  const [activeTab, setActiveTab] = useState<TabId>("dane")
  const previewSpacerRef = useRef<HTMLDivElement>(null)
  const [panelRect, setPanelRect] = useState<{ left: number; width: number } | null>(null)
  useEffect(() => {
    const update = () => {
      const el = previewSpacerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width > 0) setPanelRect({ left: r.left, width: r.width })
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  const [data, setData] = useState<FormData>(() => {
    if (!initialRaw) return { firstName: "", lastName: "", birthDate: "", deathDate: "", obituaryHeadline: "", obituaryText: "", ceremonyInfo: "", preparedByText: "", ceremonyDate: "", ceremonyTime: "", locations: defaultLocations(fhAddress), photo: null, photoBw: false, status: "draft", printTemplate: DEFAULT_PRINT_TEMPLATE }
    const parsed = parseLocationJSON(initialRaw.location ?? "", fhAddress)
    return {
      firstName: initialRaw.first_name ?? "",
      lastName: initialRaw.last_name ?? "",
      birthDate: initialRaw.birth_date?.split("T")[0] ?? "",
      deathDate: initialRaw.death_date?.split("T")[0] ?? "",
      obituaryHeadline: parsed.obituaryHeadline,
      obituaryText: initialRaw.obituary_text ?? "",
      ceremonyInfo: initialRaw.ceremony_info ?? "",
      preparedByText: parsed.preparedByText,
      ceremonyDate: parsed.ceremonyDate,
      ceremonyTime: parsed.ceremonyTime,
      locations: parsed.locations,
      photo: initialRaw.photo_url ?? null,
      photoBw: initialRaw.photo_bw ?? false,
      status: initialRaw.status ?? "draft",
      printTemplate: parsed.printTemplate,
    }
  })
  const defaultPreparedByText = (() => {
    const parts = [fhName, fhAddress, fhPhone && `tel. ${fhPhone}`].filter(Boolean).join(", ")
    return parts ? `Ceremonia przygotowana przez: ${parts}` : ""
  })()

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<ContentBlockId | null>(null)
  const [draggedGraphicItem, setDraggedGraphicItem] = useState<GraphicItemId | null>(null)

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  function updateTemplate<K extends keyof PrintTemplateSettings>(field: K, value: PrintTemplateSettings[K]) {
    setData((prev) => ({ ...prev, printTemplate: { ...prev.printTemplate, [field]: value } }))
  }

  function updateBlock<K extends keyof BlockSettings>(blockId: ContentBlockId, field: K, value: BlockSettings[K]) {
    setData((prev) => ({
      ...prev,
      printTemplate: {
        ...prev.printTemplate,
        blocks: { ...prev.printTemplate.blocks, [blockId]: { ...prev.printTemplate.blocks[blockId], [field]: value } },
      },
    }))
  }

  function updateGraphicItem<K extends keyof GraphicItemSettings>(itemId: GraphicItemId, field: K, value: GraphicItemSettings[K]) {
    setData((prev) => ({
      ...prev,
      printTemplate: {
        ...prev.printTemplate,
        graphicItems: { ...prev.printTemplate.graphicItems, [itemId]: { ...prev.printTemplate.graphicItems[itemId], [field]: value } },
      },
    }))
  }

  function applyTemplate(id: string) {
    const found = templates.find((t) => t.id === id)
    if (!found) return
    setSelectedTemplateId(id)
    setData((prev) => ({ ...prev, printTemplate: parsePrintTemplate(found.template) }))
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const canDeleteSelected = !!selectedTemplate && (isAdmin || selectedTemplate.funeral_home_id !== null)

  async function deleteSelectedTemplate() {
    if (!selectedTemplateId || !canDeleteSelected) return
    setDeleteTemplateConfirmOpen(false)
    setDeletingTemplate(true)
    try {
      const res = await fetch(`/api/print-templates/${selectedTemplateId}`, { method: "DELETE" })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `Błąd ${res.status}`)
      }
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplateId))
      setSelectedTemplateId("")
    } catch (err) {
      toast.error(`Nie udało się usunąć szablonu: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    } finally {
      setDeletingTemplate(false)
    }
  }

  async function saveAsTemplate() {
    if (!templateName.trim()) return
    setSavingTemplate(true)
    try {
      const res = await fetch("/api/print-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), template: data.printTemplate }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `Błąd ${res.status}`)
      }
      const created = await res.json()
      setTemplates((prev) => [created, ...prev])
      setSaveDialogOpen(false)
      setTemplateName("")
      toast.success("Zapisano szablon")
    } catch (err) {
      toast.error(`Nie udało się zapisać szablonu: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    } finally {
      setSavingTemplate(false)
    }
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/obituaries/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      update("photo", url)
    } catch {
      toast.error("Błąd podczas wgrywania zdjęcia")
    } finally {
      setUploading(false)
    }
  }

  async function save(status: "draft" | "published") {
    if (!data.firstName || !data.lastName) {
      toast.error("Wypełnij imię i nazwisko")
      return
    }
    setSaving(true)
    try {
      const body = {
        first_name: data.firstName,
        last_name: data.lastName,
        birth_date: data.birthDate || null,
        death_date: data.deathDate || null,
        obituary_text: data.obituaryText,
        ceremony_info: data.ceremonyInfo,
        location: serializeLocation({ ...data, preparedByText: data.preparedByText || defaultPreparedByText }),
        photo_url: data.photo,
        photo_bw: data.photoBw,
        status,
      }
      const isCreate = !recordId
      const res = isCreate
        ? await fetch("/api/obituaries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/obituaries/${recordId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
      if (!res.ok) throw new Error()
      if (isCreate) {
        const created = await res.json()
        setRecordId(created.id)
      }
      toast.success(status === "published" ? "Opublikowano!" : "Zapisano szkic")
      if (status === "published") {
        router.push(backUrl)
        return
      }
      setSaving(false)
    } catch {
      toast.error("Błąd podczas zapisywania")
      setSaving(false)
    }
  }

  const previewData = { ...data, preparedByText: data.preparedByText || defaultPreparedByText }

  return (
    <>
      {/* Tab bar — button minimal horizontal */}
      <div className="sticky top-[72px] z-10 border-b bg-background print:hidden">
        <div className="flex px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — two-column when on Dane or Szablon tab */}
      <div className="flex print:hidden">
        <div className={cn("min-w-0 p-6 pb-24", activeTab === "dane" || activeTab === "szablon" ? "w-1/2" : "flex-1")}>
          <div className="max-w-2xl space-y-6">
        {activeTab === "dane" && (
          <>
            {/* Dane podstawowe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dane podstawowe</CardTitle>
                <CardDescription>Imię, nazwisko i daty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Imię <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="np. Jan"
                      value={data.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nazwisko <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="np. Kowalski"
                      value={data.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data urodzenia</Label>
                    <DatePicker
                      value={data.birthDate}
                      max={data.deathDate || new Date().toISOString().split("T")[0]}
                      onChange={(v) => update("birthDate", v)}
                      placeholder="Wybierz datę"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data śmierci</Label>
                    <DatePicker
                      value={data.deathDate}
                      min={data.birthDate || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(v) => update("deathDate", v)}
                      placeholder="Wybierz datę"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zdjęcie portretowe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zdjęcie portretowe</CardTitle>
                <CardDescription>Opcjonalne. Zostanie wyświetlone w nekrologu.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.photo ? (
                  <div className="flex items-center gap-6">
                    <img
                      src={data.photo}
                      alt="Zdjęcie"
                      className="h-32 w-32 rounded-full object-cover shrink-0"
                      style={data.photoBw ? { filter: "grayscale(100%)" } : {}}
                    />
                    <div className="space-y-3 flex-1">
                      <p className="text-sm font-medium">Styl zdjęcia</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => update("photoBw", false)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-colors",
                            !data.photoBw
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <img src={data.photo} alt="" className="h-12 w-12 rounded object-cover" />
                          Kolorowe
                        </button>
                        <button
                          type="button"
                          onClick={() => update("photoBw", true)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-colors",
                            data.photoBw
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <img src={data.photo} alt="" className="h-12 w-12 rounded object-cover grayscale" />
                          Czarno-białe
                        </button>
                      </div>
                      <Button
                        color="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          update("photo", null)
                          update("photoBw", false)
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Usuń zdjęcie
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-12 text-center cursor-pointer transition-colors hover:bg-muted/30",
                      uploading && "opacity-60 pointer-events-none"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file)
                      }}
                    />
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {uploading ? "Wgrywanie..." : "Przeciągnij zdjęcie lub kliknij, aby wybrać"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP do 10 MB</p>
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Treść nekrologu */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Treść nekrologu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nagłówek nekrologu</Label>
                  <Textarea
                    placeholder="Z głębokim żalem zawiadomiamy, że w wieku X lat odszedł/odeszła..."
                    rows={2}
                    value={data.obituaryHeadline}
                    onChange={(e) => update("obituaryHeadline", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Krótki nagłówek wyświetlany na początku nekrologu</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Treść</Label>
                  <Textarea
                    placeholder="Treść wspomnienia..."
                    rows={6}
                    value={data.obituaryText}
                    onChange={(e) => update("obituaryText", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{data.obituaryText.length} znaków</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Informacje o ceremonii</Label>
                  <Textarea
                    placeholder="Msza święta żałobna odbędzie się..."
                    rows={3}
                    value={data.ceremonyInfo}
                    onChange={(e) => update("ceremonyInfo", e.target.value)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Przygotowane przez</Label>
                  <Textarea
                    placeholder="Ceremonia przygotowana przez: ..."
                    rows={2}
                    value={data.preparedByText || defaultPreparedByText}
                    onChange={(e) => update("preparedByText", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Wyświetlane na dole nekrologu. Widoczność i wygląd ustawisz w zakładce &bdquo;Szablon druku&rdquo;.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data i godzina ceremonii */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data i godzina ceremonii</CardTitle>
                <CardDescription>Kiedy odbędzie się ceremonia pogrzebowa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data ceremonii</Label>
                    <DatePicker
                      value={data.ceremonyDate}
                      onChange={(v) => update("ceremonyDate", v)}
                      placeholder="Wybierz datę"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Godzina ceremonii</Label>
                    <TimePicker
                      value={data.ceremonyTime}
                      onChange={(v) => update("ceremonyTime", v)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Lokalizacje nawigacji</Label>
                  {(["funeralHome", "church", "cemetery"] as const).map((key) => {
                    const labels = {
                      funeralHome: "Dom pogrzebowy",
                      church: "Kościół",
                      cemetery: "Cmentarz",
                    }
                    const entry = data.locations[key]
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            size="sm"
                            checked={entry.enabled}
                            onCheckedChange={(checked) =>
                              update("locations", {
                                ...data.locations,
                                [key]: { ...entry, enabled: checked },
                              })
                            }
                          />
                          <span
                            className="text-sm font-medium cursor-pointer select-none"
                            onClick={() =>
                              update("locations", {
                                ...data.locations,
                                [key]: { ...entry, enabled: !entry.enabled },
                              })
                            }
                          >
                            {labels[key]}
                          </span>
                        </div>
                        {entry.enabled && (
                          <Input
                            placeholder="Wpisz adres..."
                            value={entry.address}
                            onChange={(e) =>
                              update("locations", {
                                ...data.locations,
                                [key]: { ...entry, address: e.target.value },
                              })
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "szablon" && (
          <div className={cn("space-y-6", PRINT_FONTS_CLASSNAME)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ustawienia ogólne</CardTitle>
                <CardDescription>Czcionka, pozycja kolumny graficznej i wyrównanie treści w pionie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="shrink-0">Szablon</Label>
                    <Button
                      type="button"
                      color="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSaveDialogOpen(true)}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Zapisz jako szablon
                    </Button>
                  </div>
                  {templates.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={selectedTemplateId} onValueChange={(v) => v && applyTemplate(v)}>
                        <SelectTrigger className="w-full">
                          <span className="truncate">
                            {selectedTemplateId ? templates.find((t) => t.id === selectedTemplateId)?.name : "Wybierz szablon…"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                              {!isAdmin && t.funeral_home_id === null ? " (domyślny)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        color="tertiary"
                        size="icon-sm"
                        disabled={!canDeleteSelected || deletingTemplate}
                        onClick={() => setDeleteTemplateConfirmOpen(true)}
                        title={canDeleteSelected ? "Usuń szablon" : "Domyślnego szablonu nie można usunąć"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Czcionka</Label>
                  <Select
                    value={data.printTemplate.fontId}
                    onValueChange={(v) => {
                      if (!v) return
                      setData((prev) => ({
                        ...prev,
                        printTemplate: {
                          ...prev.printTemplate,
                          fontId: v as string,
                          fontWeight: getClosestWeight(v as string, prev.printTemplate.fontWeight),
                        },
                      }))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <span style={{ fontFamily: `var(${PRINT_FONTS.find((f) => f.id === data.printTemplate.fontId)?.cssVar})` }}>
                        {PRINT_FONTS.find((f) => f.id === data.printTemplate.fontId)?.label}
                      </span>
                    </SelectTrigger>
                    <SelectContent className={PRINT_FONTS_CLASSNAME}>
                      {PRINT_FONTS.map((f) => (
                        <SelectItem key={f.id} value={f.id} style={{ fontFamily: `var(${f.cssVar})` }}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grubość</Label>
                  <Select
                    value={String(data.printTemplate.fontWeight)}
                    onValueChange={(v) => v && updateTemplate("fontWeight", Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <span>{data.printTemplate.fontWeight} — {WEIGHT_NAMES[data.printTemplate.fontWeight] ?? ""}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {PRINT_FONTS.find((f) => f.id === data.printTemplate.fontId)?.weights.map((w) => (
                        <SelectItem key={w} value={String(w)}>
                          {w} — {WEIGHT_NAMES[w] ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kolumna graficzna (sygnet, QR, zdjęcie)</Label>
                  <div className="flex gap-2">
                    {([
                      { id: "left", label: "Lewo" },
                      { id: "right", label: "Prawo" },
                    ] as const).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateTemplate("columnPosition", p.id)}
                        className={cn(
                          "flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-colors",
                          data.printTemplate.columnPosition === p.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Wyrównanie treści w pionie</Label>
                  <IconToggleGroup
                    value={data.printTemplate.verticalAlign}
                    onChange={(v) => updateTemplate("verticalAlign", v)}
                    options={VALIGN_OPTIONS}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wewnętrzny margines (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.printTemplate.pagePadding}
                    onChange={(e) => updateTemplate("pagePadding", Number(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Odsuwa całą treść od krawędzi kartki — przydatne przy wąskich ramkach.</p>
                </div>
                <div className="space-y-2">
                  <Label>Odstęp między kolumnami (px)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.printTemplate.columnGap}
                    onChange={(e) => updateTemplate("columnGap", Number(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Odległość między kolumną graficzną a kolumną z treścią.</p>
                </div>
              </CardContent>
            </Card>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Zapisz jako szablon</DialogTitle>
                  <DialogDescription>
                    {isAdmin
                      ? "Nadaj nazwę. Ten szablon pojawi się do wyboru u wszystkich zakładów pogrzebowych."
                      : "Nadaj nazwę, żeby móc później zastosować ten układ w innym nekrologu."}
                  </DialogDescription>
                </DialogHeader>
                <Input
                  autoFocus
                  placeholder="np. Klasyczny ze złotą ramką"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveAsTemplate()
                  }}
                />
                <DialogFooter>
                  <Button color="secondary" onClick={() => setSaveDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button onClick={saveAsTemplate} disabled={!templateName.trim() || savingTemplate}>
                    {savingTemplate ? "Zapisuję…" : "Zapisz"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={deleteTemplateConfirmOpen} onOpenChange={setDeleteTemplateConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć ten szablon?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Szablon {selectedTemplate ? `„${selectedTemplate.name}” ` : ""}zostanie trwale usunięty. Tej operacji nie można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction color="error" onClick={deleteSelectedTemplate} disabled={deletingTemplate}>
                    {deletingTemplate ? "Usuwam…" : "Usuń"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <CollapsibleSectionCard title="Ramka" description="Dekoracyjna ramka wokół całej kartki A4.">
              <div className="flex items-center justify-between gap-2">
                <Label className="shrink-0">Kolor</Label>
                <ColorPicker
                  value={data.printTemplate.frame.color}
                  onChange={(hex) => updateTemplate("frame", { ...data.printTemplate.frame, color: hex })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FRAME_STYLE_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateTemplate("frame", { ...data.printTemplate.frame, style: f.id })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-colors",
                      data.printTemplate.frame.style === f.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-white ring-1 ring-inset ring-border">
                      {renderFrame({ style: f.id, color: data.printTemplate.frame.color })}
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{f.label}</span>
                  </button>
                ))}
              </div>
            </CollapsibleSectionCard>

            <CollapsibleSectionCard
              title="Kolumna graficzna"
              description="Przeciągnij za uchwyt, aby zmienić kolejność w pionie. Włącz/wyłącz, wyrównaj i ustaw marginesy dla zdjęcia, sygnetu i kodu QR."
            >
                <div className="space-y-2">
                  {data.printTemplate.graphicOrder.map((itemId, i) => {
                    const item = data.printTemplate.graphicItems[itemId]
                    return (
                      <div
                        key={itemId}
                        draggable
                        onDragStart={() => setDraggedGraphicItem(itemId)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (!draggedGraphicItem || draggedGraphicItem === itemId) return
                          const order = [...data.printTemplate.graphicOrder]
                          const from = order.indexOf(draggedGraphicItem)
                          const to = order.indexOf(itemId)
                          if (from === -1 || to === -1 || from === to) return
                          order.splice(from, 1)
                          order.splice(to, 0, draggedGraphicItem)
                          updateTemplate("graphicOrder", order)
                        }}
                        onDrop={(e) => e.preventDefault()}
                        onDragEnd={() => setDraggedGraphicItem(null)}
                        className={cn(
                          "rounded-lg border bg-muted/30 p-2.5 space-y-2.5 cursor-grab active:cursor-grabbing transition-opacity",
                          draggedGraphicItem === itemId && "opacity-40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                          <span className="flex-1 text-sm font-medium truncate">{GRAPHIC_LABELS[itemId]}</span>
                          <div onMouseDown={(e) => e.stopPropagation()} draggable={false}>
                            <Checkbox
                              size="sm"
                              checked={item.enabled}
                              onCheckedChange={(checked) => updateGraphicItem(itemId, "enabled", !!checked)}
                            />
                          </div>
                        </div>

                        {itemId === "sigil" && (
                          <SigilPickerRow
                            sigilId={item.sigilId ?? DEFAULT_SIGIL_ID}
                            color={item.color ?? DEFAULT_SIGIL_COLOR}
                            onSigilChange={(id) => updateGraphicItem("sigil", "sigilId", id)}
                            onColorChange={(hex) => updateGraphicItem("sigil", "color", hex)}
                          />
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">
                            {itemId === "qr" ? "Wielkość QR kodu" : itemId === "sigil" ? "Wielkość sygnetu" : "Wielkość zdjęcia"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              value={item.size}
                              onChange={(e) => updateGraphicItem(itemId, "size", Number(e.target.value) || 1)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                              className="w-16 h-7 text-right px-1.5 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">Wyrównanie</span>
                          <IconToggleGroup value={item.align} onChange={(v) => updateGraphicItem(itemId, "align", v)} options={ALIGN_OPTIONS} />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">Marginesy</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">góra</span>
                              <Input
                                type="number"
                                value={item.marginTop}
                                onChange={(e) => updateGraphicItem(itemId, "marginTop", Number(e.target.value) || 0)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                className="w-14 h-7 text-right px-1.5 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">dół</span>
                              <Input
                                type="number"
                                value={item.marginBottom}
                                onChange={(e) => updateGraphicItem(itemId, "marginBottom", Number(e.target.value) || 0)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                className="w-14 h-7 text-right px-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
            </CollapsibleSectionCard>

            <CollapsibleSectionCard
              title="Kolumna z treścią"
              description="Przeciągnij za uchwyt, aby zmienić kolejność. Każdy blok ma własny rozmiar, czcionkę, wyrównanie i marginesy."
            >
                <div className="space-y-2">
                  {data.printTemplate.blockOrder.map((blockId, i) => {
                    const block = data.printTemplate.blocks[blockId]
                    const isTextBlock = blockId !== "photo" && blockId !== "sigil"
                    const effectiveFontId = block.fontId ?? data.printTemplate.fontId
                    const weightOptions = PRINT_FONTS.find((f) => f.id === effectiveFontId)?.weights ?? []
                    return (
                      <div
                        key={blockId}
                        draggable
                        onDragStart={() => setDraggedBlock(blockId)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (!draggedBlock || draggedBlock === blockId) return
                          const order = [...data.printTemplate.blockOrder]
                          const from = order.indexOf(draggedBlock)
                          const to = order.indexOf(blockId)
                          if (from === -1 || to === -1 || from === to) return
                          order.splice(from, 1)
                          order.splice(to, 0, draggedBlock)
                          updateTemplate("blockOrder", order)
                        }}
                        onDrop={(e) => e.preventDefault()}
                        onDragEnd={() => setDraggedBlock(null)}
                        className={cn(
                          "rounded-lg border bg-muted/30 p-2.5 space-y-2.5 cursor-grab active:cursor-grabbing transition-opacity",
                          draggedBlock === blockId && "opacity-40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                          <span className="flex-1 text-sm font-medium truncate">{BLOCK_LABELS[blockId]}</span>
                          {(blockId === "sp" || blockId === "photo" || blockId === "sigil" || blockId === "ceremonyBy") && (
                            <div onMouseDown={(e) => e.stopPropagation()} draggable={false}>
                              <Checkbox
                                size="sm"
                                checked={block.enabled ?? true}
                                onCheckedChange={(checked) => updateBlock(blockId, "enabled", !!checked)}
                              />
                            </div>
                          )}
                        </div>

                        {blockId === "sp" && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Treść</span>
                            <Input
                              value={block.text ?? ""}
                              onChange={(e) => updateBlock(blockId, "text", e.target.value)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                              placeholder="Ś.P."
                              className="w-48 h-7 text-right px-1.5 text-xs"
                            />
                          </div>
                        )}

                        {blockId === "sigil" && (
                          <SigilPickerRow
                            sigilId={block.sigilId ?? DEFAULT_SIGIL_ID}
                            color={block.color ?? DEFAULT_SIGIL_COLOR}
                            onSigilChange={(id) => updateBlock(blockId, "sigilId", id)}
                            onColorChange={(hex) => updateBlock(blockId, "color", hex)}
                          />
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">
                            {blockId === "photo" ? "Wielkość zdjęcia" : blockId === "sigil" ? "Wielkość sygnetu" : "Rozmiar czcionki"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              value={block.size}
                              onChange={(e) => updateBlock(blockId, "size", Number(e.target.value) || 1)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                              className="w-16 h-7 text-right px-1.5 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">px</span>
                          </div>
                        </div>

                        {isTextBlock && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Czcionka</span>
                            <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()} draggable={false}>
                              <Select
                                value={block.fontId ?? "__default__"}
                                onValueChange={(v) => {
                                  if (!v) return
                                  const fontId = v === "__default__" ? undefined : (v as string)
                                  updateBlock(blockId, "fontId", fontId)
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-32">
                                  <span className="truncate">
                                    {block.fontId ? PRINT_FONTS.find((f) => f.id === block.fontId)?.label : "Domyślna"}
                                  </span>
                                </SelectTrigger>
                                <SelectContent className={PRINT_FONTS_CLASSNAME}>
                                  <SelectItem value="__default__">Domyślna</SelectItem>
                                  {PRINT_FONTS.map((f) => (
                                    <SelectItem key={f.id} value={f.id} style={{ fontFamily: `var(${f.cssVar})` }}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={block.fontWeight !== undefined ? String(block.fontWeight) : "__default__"}
                                onValueChange={(v) => {
                                  if (!v) return
                                  updateBlock(blockId, "fontWeight", v === "__default__" ? undefined : Number(v))
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-24">
                                  <span className="truncate">
                                    {block.fontWeight !== undefined ? String(block.fontWeight) : "Domyślna"}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__default__">Domyślna</SelectItem>
                                  {weightOptions.map((w) => (
                                    <SelectItem key={w} value={String(w)}>
                                      {w}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">Wyrównanie</span>
                          <IconToggleGroup value={block.align} onChange={(v) => updateBlock(blockId, "align", v)} options={ALIGN_OPTIONS} />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground shrink-0">Marginesy</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">góra</span>
                              <Input
                                type="number"
                                value={block.marginTop}
                                onChange={(e) => updateBlock(blockId, "marginTop", Number(e.target.value) || 0)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                className="w-14 h-7 text-right px-1.5 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">dół</span>
                              <Input
                                type="number"
                                value={block.marginBottom}
                                onChange={(e) => updateBlock(blockId, "marginBottom", Number(e.target.value) || 0)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                className="w-14 h-7 text-right px-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
            </CollapsibleSectionCard>
          </div>
        )}

        {activeTab === "enekrolog" && (
          <div className="flex items-center justify-center h-48 rounded-xl border border-dashed text-sm text-muted-foreground">
            eNekrolog — wkrótce
          </div>
        )}
          </div>
        </div>

        {/* Right: A4 preview */}
        {(activeTab === "dane" || activeTab === "szablon") && (
          <>
            <div ref={previewSpacerRef} className="hidden xl:block w-1/2 shrink-0" />
            {panelRect && (
              <div
                style={{
                  position: "fixed",
                  left: panelRect.left,
                  width: panelRect.width,
                  top: 117,
                  bottom: 64,
                  zIndex: 45,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: 32,
                }}
              >
                <ObituaryPreview
                  data={previewData}
                  availableWidth={panelRect.width - 64}
                  template={data.printTemplate}
                  publicUrl={recordId ? `${BASE_URL}/obituary/${recordId}` : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-60 right-0 z-10 border-t bg-background px-6 py-3 flex items-center justify-between print:hidden">
        <Button
          color="tertiary"
          onClick={() => router.push(backUrl)}
          disabled={saving}
        >
          Anuluj
        </Button>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"

            onClick={() => save("draft")}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Zapisuję…" : "Zapisz szkic"}
          </Button>
          <Button color="secondary" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Pobierz .pdf
          </Button>
          <Button onClick={() => save("published")} disabled={saving}>
            <Send className="h-4 w-4" />
            {saving ? "Zapisuję…" : "Opublikuj"}
          </Button>
        </div>
      </div>

      {/* Print-only A4 page — hidden on screen, shown (and only this) when printing/exporting to PDF */}
      <div className="hidden print:block obituary-print-area">
        <ObituaryPreview
          data={previewData}
          template={data.printTemplate}
          publicUrl={recordId ? `${BASE_URL}/obituary/${recordId}` : undefined}
          bare
        />
      </div>
    </>
  )
}
