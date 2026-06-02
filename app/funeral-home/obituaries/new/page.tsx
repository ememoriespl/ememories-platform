"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ChevronLeft, ChevronRight, Upload, Send, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, label: "Dane podstawowe" },
  { id: 2, label: "Treść" },
  { id: 3, label: "Zdjęcie" },
  { id: 4, label: "Podgląd i publikacja" },
]

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
}

const empty: FormData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  deathDate: "",
  obituaryText: "",
  ceremonyInfo: "",
  location: "",
  photo: null,
  photoBw: false,
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step.id < current
                  ? "bg-foreground text-background"
                  : step.id === current
                  ? "ring-2 ring-foreground bg-background text-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id < current ? <CheckCircle className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                step.id === current ? "font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn("h-px w-8 lg:w-16 shrink-0", step.id < current ? "bg-foreground" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function NewObituaryPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(empty)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)

  function update(field: keyof FormData, value: string | boolean) {
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

  function canProceed() {
    if (step === 1) return data.firstName && data.lastName && data.birthDate && data.deathDate
    if (step === 2) return data.obituaryText && data.ceremonyInfo && data.location
    return true
  }

  async function handleSaveDraft() {
    if (!data.firstName || !data.lastName) {
      toast.error("Wypełnij imię i nazwisko przed zapisaniem szkicu")
      return
    }
    try {
      const res = await fetch("/api/obituaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          birth_date: data.birthDate || null,
          death_date: data.deathDate || null,
          obituary_text: data.obituaryText,
          ceremony_info: data.ceremonyInfo,
          location: data.location,
          photo_url: data.photo,
          photo_bw: data.photoBw,
          status: "draft",
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Szkic zapisany")
      router.push("/funeral-home/obituaries")
    } catch {
      toast.error("Błąd podczas zapisywania szkicu")
    }
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch("/api/obituaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          birth_date: data.birthDate || null,
          death_date: data.deathDate || null,
          obituary_text: data.obituaryText,
          ceremony_info: data.ceremonyInfo,
          location: data.location,
          photo_url: data.photo,
          photo_bw: data.photoBw,
          status: "published",
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Nekrolog opublikowany!")
      router.push("/funeral-home/obituaries")
    } catch {
      toast.error("Błąd podczas publikowania")
      setPublishing(false)
    }
  }

  return (
    <>
      <Topbar title="Nowy nekrolog" subtitle="Wypełnij formularz krok po kroku" />

      <div className="p-6 max-w-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <StepIndicator current={step} />
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSaveDraft}>
            Zapisz szkic
          </Button>
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dane podstawowe</CardTitle>
              <CardDescription>Imię, nazwisko i daty zmarłego/ej</CardDescription>
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
                  <Label>Data urodzenia <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={data.birthDate}
                    onChange={(e) => update("birthDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data śmierci <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={data.deathDate}
                    onChange={(e) => update("deathDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Content */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Treść nekrologu</CardTitle>
              <CardDescription>Tekst wspomnienia oraz informacje o ceremonii</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Treść nekrologu <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Z głębokim żalem zawiadamiamy..."
                  rows={5}
                  value={data.obituaryText}
                  onChange={(e) => update("obituaryText", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{data.obituaryText.length} znaków</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Informacje o ceremonii <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Msza święta żałobna odbędzie się..."
                  rows={3}
                  value={data.ceremonyInfo}
                  onChange={(e) => update("ceremonyInfo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Miejsce ceremonii <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="np. Kościół pw. Wniebowzięcia NMP, ul. Kościelna 1"
                  value={data.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Photo */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zdjęcie portretowe</CardTitle>
              <CardDescription>Opcjonalne. Zostanie wyświetlone w nekrologu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.photo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                      <img
                        src={data.photo}
                        alt="Zdjęcie"
                        className="h-32 w-32 rounded-full object-cover"
                        style={data.photoBw ? { filter: "grayscale(100%)" } : {}}
                      />
                    </div>
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
                        onClick={() => { update("photo", ""); update("photoBw", false) }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Usuń zdjęcie
                      </Button>
                    </div>
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
              <p className="text-xs text-center text-muted-foreground">
                Jeśli pominiesz ten krok, nekrolog zostanie wyświetlony z inicjałami
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Preview & publish */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Podgląd nekrologu</CardTitle>
                    <CardDescription>Sprawdź jak będzie wyglądał przed publikacją</CardDescription>
                  </div>
                  <Badge variant="outline">Wersja robocza</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                      {data.firstName?.[0] || "?"}{data.lastName?.[0] || "?"}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {data.firstName || "Imię"} {data.lastName || "Nazwisko"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {data.birthDate
                          ? new Date(data.birthDate).toLocaleDateString("pl-PL")
                          : "—"}{" "}
                        —{" "}
                        {data.deathDate
                          ? new Date(data.deathDate).toLocaleDateString("pl-PL")
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {data.obituaryText || "Treść nekrologu pojawi się tutaj..."}
                  </p>
                  {(data.ceremonyInfo || data.location) && (
                    <>
                      <Separator />
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Informacje o ceremonii
                        </p>
                        <p className="text-sm">{data.ceremonyInfo}</p>
                        {data.location && (
                          <p className="text-sm text-muted-foreground">{data.location}</p>
                        )}
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        [ KOD QR ZOSTANIE WYGENEROWANY PO PUBLIKACJI ]
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Gotowe do publikacji</p>
                    <p className="text-xs text-muted-foreground">
                      Po kliknięciu &ldquo;Opublikuj&rdquo; zostanie automatycznie wygenerowany unikalny kod QR. Nekrolog będzie widoczny publicznie pod dedykowanym adresem URL.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : router.push("/funeral-home/obituaries"))}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? "Anuluj" : "Wstecz"}
          </Button>

          <div className="flex items-center gap-2">
            {step < 4 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Dalej
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <>
                <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
                  <Eye className="h-4 w-4" />
                  Zapisz szkic
                </Button>
                <Button
                  className="gap-2"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  <Send className="h-4 w-4" />
                  {publishing ? "Publikuję..." : "Opublikuj"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
