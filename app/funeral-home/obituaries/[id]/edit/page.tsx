"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Upload, X, Save, Send, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FormData {
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  obituaryText: string
  ceremonyInfo: string
  location: string
  photo: string | null
  photoBw: boolean
  status: string
}

export default function EditObituaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<FormData | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/obituaries/${id}`)
      .then((r) => r.json())
      .then((o) => {
        setData({
          firstName: o.first_name ?? "",
          lastName: o.last_name ?? "",
          birthDate: o.birth_date?.split("T")[0] ?? "",
          deathDate: o.death_date?.split("T")[0] ?? "",
          obituaryText: o.obituary_text ?? "",
          ceremonyInfo: o.ceremony_info ?? "",
          location: o.location ?? "",
          photo: o.photo_url ?? null,
          photoBw: o.photo_bw ?? false,
          status: o.status ?? "draft",
        })
      })
      .catch(() => toast.error("Nie udało się załadować nekrologu"))
  }, [id])

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => prev ? { ...prev, [field]: value } : prev)
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

  async function handleSave(publish?: boolean) {
    if (!data) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        first_name: data.firstName,
        last_name: data.lastName,
        birth_date: data.birthDate || null,
        death_date: data.deathDate || null,
        obituary_text: data.obituaryText,
        ceremony_info: data.ceremonyInfo,
        location: data.location,
        photo_url: data.photo,
        photo_bw: data.photoBw,
      }
      if (publish) body.status = "published"

      const res = await fetch(`/api/obituaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(publish ? "Opublikowano!" : "Zapisano zmiany")
      router.push("/funeral-home/obituaries")
    } catch {
      toast.error("Błąd podczas zapisywania")
      setSaving(false)
    }
  }

  if (!data) {
    return (
      <>
        <Topbar title="Edycja nekrologu" subtitle="" />
        <div className="p-6 text-sm text-muted-foreground">Ładowanie…</div>
      </>
    )
  }

  return (
    <>
      <Topbar title="Edycja nekrologu" subtitle={`${data.firstName} ${data.lastName}`} />

      <div className="p-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/funeral-home/obituaries">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
              Powrót
            </Button>
          </Link>
        </div>

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dane podstawowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Imię <span className="text-destructive">*</span></Label>
                <Input
                  value={data.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nazwisko <span className="text-destructive">*</span></Label>
                <Input
                  value={data.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data urodzenia</Label>
                <Input
                  type="date"
                  value={data.birthDate}
                  max={data.deathDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data śmierci</Label>
                <Input
                  type="date"
                  value={data.deathDate}
                  min={data.birthDate || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => update("deathDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Treść nekrologu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Treść nekrologu</Label>
              <Textarea
                rows={5}
                value={data.obituaryText}
                onChange={(e) => update("obituaryText", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{data.obituaryText.length} znaków</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Informacje o ceremonii</Label>
              <Textarea
                rows={3}
                value={data.ceremonyInfo}
                onChange={(e) => update("ceremonyInfo", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Miejsce ceremonii</Label>
              <Input
                value={data.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zdjęcie portretowe</CardTitle>
            <CardDescription>Opcjonalne</CardDescription>
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
                        !data.photoBw ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
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
                        data.photoBw ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <img src={data.photo} alt="" className="h-12 w-12 rounded object-cover grayscale" />
                      Czarno-białe
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { update("photo", null); update("photoBw", false) }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Usuń zdjęcie
                  </Button>
                </div>
              </div>
            ) : (
              <label className={cn(
                "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-12 text-center cursor-pointer transition-colors hover:bg-muted/30",
                uploading && "opacity-60 pointer-events-none"
              )}>
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" className="gap-2" onClick={() => handleSave()} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Zapisuję…" : "Zapisz zmiany"}
          </Button>
          {data.status !== "published" && (
            <Button className="gap-2" onClick={() => handleSave(true)} disabled={saving}>
              <Send className="h-4 w-4" />
              Zapisz i opublikuj
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
