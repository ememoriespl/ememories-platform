"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, Send, Save, GripVertical } from "lucide-react"
import { ObituaryPreview, DEFAULT_PRINT_TEMPLATE, DEFAULT_BLOCK_ORDER, type PrintTemplateSettings, type BlockSettings } from "@/components/funeral-home/obituary-preview"
import { PRINT_FONTS, PRINT_FONTS_CLASSNAME, getClosestWeight } from "@/lib/print-fonts"
import { PRINT_SIGILS } from "@/lib/print-sigils"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import type { ContentBlockId } from "@/components/funeral-home/obituary-preview"
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
  name: "Imię i nazwisko",
  dates: "Data",
  headline: "Nagłówek",
  body: "Treść",
  ceremony: "Ceremonia",
}

const ALIGN_OPTIONS = [
  { id: "left", label: "Lewo" },
  { id: "center", label: "Środek" },
  { id: "right", label: "Prawo" },
] as const

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

function reconcileBlockOrder(saved: unknown): ContentBlockId[] {
  const savedOrder = Array.isArray(saved) ? saved.filter((id): id is ContentBlockId => DEFAULT_BLOCK_ORDER.includes(id)) : []
  const missing = DEFAULT_BLOCK_ORDER.filter((id) => !savedOrder.includes(id))
  return [...missing, ...savedOrder]
}

function parsePrintTemplate(raw: unknown): PrintTemplateSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_PRINT_TEMPLATE
  const p = raw as Partial<PrintTemplateSettings> & { blocks?: Partial<Record<ContentBlockId, Partial<BlockSettings>>> }
  const blocks = { ...DEFAULT_PRINT_TEMPLATE.blocks }
  for (const id of DEFAULT_BLOCK_ORDER) {
    blocks[id] = { ...DEFAULT_PRINT_TEMPLATE.blocks[id], ...p.blocks?.[id] }
  }
  return {
    fontId: p.fontId ?? DEFAULT_PRINT_TEMPLATE.fontId,
    fontWeight: p.fontWeight ?? DEFAULT_PRINT_TEMPLATE.fontWeight,
    sigilId: p.sigilId ?? DEFAULT_PRINT_TEMPLATE.sigilId,
    sigilSize: p.sigilSize ?? DEFAULT_PRINT_TEMPLATE.sigilSize,
    showPhoto: p.showPhoto ?? DEFAULT_PRINT_TEMPLATE.showPhoto,
    qrSize: p.qrSize ?? DEFAULT_PRINT_TEMPLATE.qrSize,
    columnPosition: p.columnPosition ?? DEFAULT_PRINT_TEMPLATE.columnPosition,
    verticalAlign: p.verticalAlign ?? DEFAULT_PRINT_TEMPLATE.verticalAlign,
    blockOrder: reconcileBlockOrder(p.blockOrder),
    blocks,
  }
}

function parseLocationJSON(
  raw: string,
  fhAddress: string
): Pick<FormData, "locations" | "obituaryHeadline" | "ceremonyDate" | "ceremonyTime" | "printTemplate"> {
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
      ceremonyDate: parsed.ceremonyDate ?? "",
      ceremonyTime: parsed.ceremonyTime ?? "",
      printTemplate: parsePrintTemplate(parsed.printTemplate),
    }
  } catch {
    return {
      locations: defaultLocations(fhAddress),
      obituaryHeadline: "",
      ceremonyDate: "",
      ceremonyTime: "",
      printTemplate: DEFAULT_PRINT_TEMPLATE,
    }
  }
}

function serializeLocation(data: FormData): string {
  return JSON.stringify({
    v: 4,
    obituaryHeadline: data.obituaryHeadline,
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
}

export interface ObituaryFormProps {
  mode: "new" | "edit"
  obituaryId?: string
  initialRaw?: ObituaryRaw
  fhAddress?: string
  backUrl?: string
}

export function ObituaryForm({ mode, obituaryId, initialRaw, fhAddress = "", backUrl = "/funeral-home/dashboard" }: ObituaryFormProps) {
  const router = useRouter()
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
    if (!initialRaw) return { firstName: "", lastName: "", birthDate: "", deathDate: "", obituaryHeadline: "", obituaryText: "", ceremonyInfo: "", ceremonyDate: "", ceremonyTime: "", locations: defaultLocations(fhAddress), photo: null, photoBw: false, status: "draft", printTemplate: DEFAULT_PRINT_TEMPLATE }
    const parsed = parseLocationJSON(initialRaw.location ?? "", fhAddress)
    return {
      firstName: initialRaw.first_name ?? "",
      lastName: initialRaw.last_name ?? "",
      birthDate: initialRaw.birth_date?.split("T")[0] ?? "",
      deathDate: initialRaw.death_date?.split("T")[0] ?? "",
      obituaryHeadline: parsed.obituaryHeadline,
      obituaryText: initialRaw.obituary_text ?? "",
      ceremonyInfo: initialRaw.ceremony_info ?? "",
      ceremonyDate: parsed.ceremonyDate,
      ceremonyTime: parsed.ceremonyTime,
      locations: parsed.locations,
      photo: initialRaw.photo_url ?? null,
      photoBw: initialRaw.photo_bw ?? false,
      status: initialRaw.status ?? "draft",
      printTemplate: parsed.printTemplate,
    }
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<ContentBlockId | null>(null)

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
        location: serializeLocation(data),
        photo_url: data.photo,
        photo_bw: data.photoBw,
        status,
      }
      const res =
        mode === "new"
          ? await fetch("/api/obituaries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          : await fetch(`/api/obituaries/${obituaryId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
      if (!res.ok) throw new Error()
      toast.success(status === "published" ? "Opublikowano!" : "Zapisano szkic")
      router.push(backUrl)
    } catch {
      toast.error("Błąd podczas zapisywania")
      setSaving(false)
    }
  }

  return (
    <>
      {/* Tab bar — button minimal horizontal */}
      <div className="sticky top-[72px] z-10 border-b bg-background">
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
      <div className="flex">
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
                <CardTitle className="text-base">Czcionka</CardTitle>
                <CardDescription>Krój i grubość dla całego szablonu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zdjęcie</CardTitle>
                <CardDescription>Widoczność zdjęcia portretowego na wydruku</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="sm"
                    checked={data.printTemplate.showPhoto}
                    onCheckedChange={(checked) => updateTemplate("showPhoto", !!checked)}
                  />
                  <span
                    className="text-sm font-medium cursor-pointer select-none"
                    onClick={() => updateTemplate("showPhoto", !data.printTemplate.showPhoto)}
                  >
                    Pokaż zdjęcie na wydruku
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kod QR</CardTitle>
                <CardDescription>Wielkość kodu QR prowadzącego do eNekrologu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <Label>Wielkość QR kodu</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      value={data.printTemplate.qrSize}
                      onChange={(e) => updateTemplate("qrSize", Number(e.target.value) || 1)}
                      className="w-20 text-right"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Układ</CardTitle>
                <CardDescription>Pozycja kolumny graficznej, wyrównanie i kolejność bloków treści</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kolumna graficzna (sygnet, QR)</Label>
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
                  <div className="flex gap-2">
                    {([
                      { id: "top", label: "Góra" },
                      { id: "center", label: "Środek" },
                      { id: "bottom", label: "Dół" },
                    ] as const).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => updateTemplate("verticalAlign", v.id)}
                        className={cn(
                          "flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-colors",
                          data.printTemplate.verticalAlign === v.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bloki treści</Label>
                  <p className="text-xs text-muted-foreground">
                    Przeciągnij za uchwyt, aby zmienić kolejność. Każdy blok ma własny rozmiar, wyrównanie i marginesy.
                  </p>
                  <div className="space-y-2">
                    {data.printTemplate.blockOrder.map((blockId, i) => {
                      const block = data.printTemplate.blocks[blockId]
                      return (
                        <div
                          key={blockId}
                          draggable
                          onDragStart={() => setDraggedBlock(blockId)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (!draggedBlock || draggedBlock === blockId) return
                            const order = [...data.printTemplate.blockOrder]
                            const from = order.indexOf(draggedBlock)
                            const to = order.indexOf(blockId)
                            order.splice(from, 1)
                            order.splice(to, 0, draggedBlock)
                            updateTemplate("blockOrder", order)
                            setDraggedBlock(null)
                          }}
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
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">
                              {blockId === "photo" ? "Wielkość zdjęcia" : "Rozmiar czcionki"}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
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
                              {blockId === "ceremony" && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">etykieta</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={block.labelSize ?? 9}
                                    onChange={(e) => updateBlock(blockId, "labelSize", Number(e.target.value) || 1)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                    className="w-16 h-7 text-right px-1.5 text-xs"
                                  />
                                  <span className="text-[10px] text-muted-foreground">px</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Wyrównanie</span>
                            <div className="flex gap-1">
                              {ALIGN_OPTIONS.map((a) => (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => updateBlock(blockId, "align", a.id)}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
                                  className={cn(
                                    "rounded-md border-2 px-2 py-1 text-[10px] font-medium transition-colors",
                                    block.align === a.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-muted-foreground"
                                  )}
                                >
                                  {a.label}
                                </button>
                              ))}
                            </div>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sygnet</CardTitle>
                <CardDescription>Symbol wyświetlany nad zdjęciem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {PRINT_SIGILS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={s.label}
                      onClick={() => updateTemplate("sigilId", s.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 rounded-lg border-2 py-3 text-lg transition-colors",
                        data.printTemplate.sigilId === s.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <span>{s.char}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label>Wielkość sygnetu</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      value={data.printTemplate.sigilSize}
                      onChange={(e) => updateTemplate("sigilSize", Number(e.target.value) || 1)}
                      className="w-20 text-right"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  data={data}
                  availableWidth={panelRect.width - 64}
                  template={data.printTemplate}
                  publicUrl={obituaryId ? `${BASE_URL}/obituary/${obituaryId}` : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-60 right-0 z-10 border-t bg-background px-6 py-3 flex items-center justify-between">
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
          <Button onClick={() => save("published")} disabled={saving}>
            <Send className="h-4 w-4" />
            {saving ? "Zapisuję…" : "Opublikuj"}
          </Button>
        </div>
      </div>
    </>
  )
}
