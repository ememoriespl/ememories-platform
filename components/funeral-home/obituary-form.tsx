"use client"

import { useState } from "react"
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
import { Upload, X, Send, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
}

function defaultLocations(fhAddress = ""): Locations {
  return {
    funeralHome: { enabled: true, address: fhAddress },
    church: { enabled: false, address: "" },
    cemetery: { enabled: false, address: "" },
  }
}

function parseLocationJSON(
  raw: string,
  fhAddress: string
): Pick<FormData, "locations" | "obituaryHeadline" | "ceremonyDate" | "ceremonyTime"> {
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
    }
  } catch {
    return {
      locations: defaultLocations(fhAddress),
      obituaryHeadline: "",
      ceremonyDate: "",
      ceremonyTime: "",
    }
  }
}

function serializeLocation(data: FormData): string {
  return JSON.stringify({
    v: 3,
    obituaryHeadline: data.obituaryHeadline,
    ceremonyDate: data.ceremonyDate,
    ceremonyTime: data.ceremonyTime,
    funeralHome: data.locations.funeralHome,
    church: data.locations.church,
    cemetery: data.locations.cemetery,
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
}

export function ObituaryForm({ mode, obituaryId, initialRaw, fhAddress = "" }: ObituaryFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("dane")
  const [data, setData] = useState<FormData>(() => {
    if (!initialRaw) return { firstName: "", lastName: "", birthDate: "", deathDate: "", obituaryHeadline: "", obituaryText: "", ceremonyInfo: "", ceremonyDate: "", ceremonyTime: "", locations: defaultLocations(fhAddress), photo: null, photoBw: false, status: "draft" }
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
    }
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }))
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
      router.push("/funeral-home/dashboard")
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

      {/* Tab content */}
      <div className="p-6 max-w-2xl space-y-6 pb-24">
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
          <div className="flex items-center justify-center h-48 rounded-xl border border-dashed text-sm text-muted-foreground">
            Szablon druku — wkrótce
          </div>
        )}

        {activeTab === "enekrolog" && (
          <div className="flex items-center justify-center h-48 rounded-xl border border-dashed text-sm text-muted-foreground">
            eNekrolog — wkrótce
          </div>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-60 right-0 z-10 border-t bg-background px-6 py-3 flex items-center justify-between">
        <Button
          color="tertiary"
          onClick={() => router.push("/funeral-home/dashboard")}
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
