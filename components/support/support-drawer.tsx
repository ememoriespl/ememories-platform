"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Loader2, Paperclip, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  TICKET_KINDS,
  TICKET_KIND_META,
  TICKET_STATUS_META,
  type Ticket,
  type TicketContext,
  type TicketKind,
  type TicketStatus,
} from "@/lib/tickets"

const DRAFT_KEY = "support-draft"
const MAX_UPLOAD_MB = 4

/** Wording that changes with the kind — the fields themselves stay the same two. */
const FIELDS: Record<TicketKind, { titleLabel: string; titlePlaceholder: string; bodyLabel: string; bodyPlaceholder: string }> = {
  bug: {
    titleLabel: "Krótki opis problemu",
    titlePlaceholder: "np. Eksport do PDF zwraca pusty plik",
    bodyLabel: "Co się stało i czego się spodziewałeś?",
    bodyPlaceholder:
      "Kliknąłem „Pobierz .pdf”, dostałem pusty plik. Spodziewałem się nekrologu na jednej stronie.",
  },
  idea: {
    titleLabel: "Czego dotyczy",
    titlePlaceholder: "np. Szablony treści nekrologu",
    bodyLabel: "Jaki problem to rozwiąże?",
    bodyPlaceholder:
      "Za każdym razem wpisujemy podobną treść od zera. Zajmuje to kilka minut przy każdym nekrologu.",
  },
  question: {
    titleLabel: "Czego dotyczy pytanie",
    titlePlaceholder: "np. Kod QR na wydruku",
    bodyLabel: "Twoje pytanie",
    bodyPlaceholder: "Czy kod QR działa, zanim opublikuję nekrolog?",
  },
}

interface Draft {
  kind?: TicketKind
  title?: string
  description?: string
  email?: string
}

/** An unsent draft: a network failure or a mis-click must not cost what the reporter typed. */
function readDraft(): Draft {
  if (typeof window === "undefined") return {}
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}")
    return {
      kind: TICKET_KINDS.includes(d?.kind) ? d.kind : undefined,
      title: typeof d?.title === "string" ? d.title : undefined,
      description: typeof d?.description === "string" ? d.description : undefined,
      email: typeof d?.email === "string" ? d.email : undefined,
    }
  } catch {
    return {}
  }
}

function collectContext(consoleErrors: string[]): TicketContext {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}×${window.screen.height}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    consoleErrors: consoleErrors.slice(-5),
  }
}

export function SupportDrawer({
  open,
  onOpenChange,
  consoleErrors,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  consoleErrors: string[]
}) {
  const [draft] = useState(readDraft)
  const [kind, setKind] = useState<TicketKind | null>(draft.kind ?? null)
  const [title, setTitle] = useState(draft.title ?? "")
  const [description, setDescription] = useState(draft.description ?? "")
  const [email, setEmail] = useState(draft.email ?? "")
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<Ticket | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [history, setHistory] = useState<Ticket[]>([])

  useEffect(() => {
    if (sent) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ kind, title, description, email }))
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [kind, title, description, email, sent])

  // The reporter's own tickets, so "czy dostaliście?" is answered by the drawer itself.
  useEffect(() => {
    if (!open) return
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => setEmail((prev) => prev || me?.email || ""))
      .catch(() => {})
    fetch("/api/tickets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [open])

  async function uploadFiles(list: FileList | File[]) {
    const picked = Array.from(list)
    if (picked.length === 0) return
    setUploading(true)
    try {
      for (const file of picked) {
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
          toast.error(`${file.name}: plik waży ${(file.size / 1024 / 1024).toFixed(1)} MB — maksymalnie ${MAX_UPLOAD_MB} MB.`)
          continue
        }
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/tickets/upload", { method: "POST", body: fd })
        if (!res.ok) {
          toast.error(`Nie udało się wgrać ${file.name}`)
          continue
        }
        const { url, name } = await res.json()
        setFiles((prev) => [...prev, { url, name: name ?? file.name }])
      }
    } finally {
      setUploading(false)
    }
  }

  async function send() {
    if (!kind) return
    setSending(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          description,
          email,
          attachments: files.map((f) => f.url),
          context: collectContext(consoleErrors),
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
      const ticket: Ticket = await res.json()
      setSent(ticket)
      setHistory((prev) => [ticket, ...prev])
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // ignore
      }
    } catch (err) {
      toast.error(`Nie udało się wysłać zgłoszenia: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    } finally {
      setSending(false)
    }
  }

  function startAnother() {
    setSent(null)
    setKind(null)
    setTitle("")
    setDescription("")
    setFiles([])
  }

  const fields = kind ? FIELDS[kind] : null
  const canSend = !!kind && title.trim().length > 0 && description.trim().length > 0 && !sending && !uploading

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b p-6">
          <SheetTitle>Zgłoszenie</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {sent ? (
            <div className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm font-semibold">Zgłoszenie przyjęte</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Numer zgłoszenia: <span className="font-mono font-medium text-foreground">{sent.reference}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Odpowiedź wyślemy na <span className="text-foreground">{sent.email}</span>.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Treść zgłoszenia
                </p>
                <p className="text-sm font-medium">{sent.title}</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{sent.body}</p>
              </div>

              <Button color="secondary" onClick={startAnother}>
                Zgłoś coś jeszcze
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1 — the one classification the reporter makes */}
              <div className="space-y-2">
                <Label>Czego dotyczy zgłoszenie?</Label>
                <div className="grid gap-2">
                  {TICKET_KINDS.map((k) => {
                    const meta = TICKET_KIND_META[k]
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                          kind === k ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <span className="text-lg leading-none">{meta.emoji}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{meta.label}</span>
                          <span className="block text-xs text-muted-foreground">{meta.hint}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2 — revealed only once the kind is known */}
              {fields && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-title">{fields.titleLabel}</Label>
                    <Input
                      id="ticket-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={fields.titlePlaceholder}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-body">{fields.bodyLabel}</Label>
                    <Textarea
                      id="ticket-body"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={fields.bodyPlaceholder}
                      rows={5}
                    />
                  </div>

                  {kind === "bug" && (
                    <div className="space-y-1.5">
                      <Label>Zrzut ekranu lub nagranie</Label>
                      <label
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragging(true)
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragging(false)
                          uploadFiles(e.dataTransfer.files)
                        }}
                        className={cn(
                          "relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                          dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                        )}
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files) uploadFiles(e.target.files)
                            e.target.value = ""
                          }}
                        />
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Przeciągnij pliki lub kliknij, aby wybrać</span>
                        <span className="text-xs text-muted-foreground">
                          Obrazy i nagrania · do {MAX_UPLOAD_MB} MB każdy
                        </span>
                      </label>

                      {files.length > 0 && (
                        <ul className="space-y-1">
                          {files.map((f) => (
                            <li
                              key={f.url}
                              className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                            >
                              <span className="truncate">{f.name}</span>
                              <button
                                type="button"
                                aria-label={`Usuń ${f.name}`}
                                onClick={() => setFiles((prev) => prev.filter((x) => x.url !== f.url))}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-email">Adres e-mail</Label>
                    <Input
                      id="ticket-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Odpowiedź wyślemy na ten adres.</p>
                  </div>

                  {/* Nothing here is asked of the reporter — it is shown so they know what goes with it. */}
                  <div className="rounded-xl border">
                    <button
                      type="button"
                      onClick={() => setShowContext((v) => !v)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
                    >
                      <span className="text-muted-foreground">Dołączamy dane techniczne</span>
                      <ChevronDown
                        className={cn("h-4 w-4 text-muted-foreground transition-transform", showContext && "rotate-180")}
                      />
                    </button>
                    {showContext && (
                      <dl className="space-y-1 border-t px-4 py-3 text-xs text-muted-foreground">
                        {Object.entries(collectContext(consoleErrors)).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <dt className="w-24 shrink-0">{k}</dt>
                            <dd className="min-w-0 break-words">
                              {Array.isArray(v) ? (v.length ? v.join(" · ") : "brak") : String(v)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div className="space-y-2 border-t pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Twoje zgłoszenia
                  </p>
                  <ul className="space-y-1">
                    {history.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{t.title}</span>
                        <Badge variant={TICKET_STATUS_META[t.status as TicketStatus]?.variant ?? "gray"}>
                          {TICKET_STATUS_META[t.status as TicketStatus]?.label ?? t.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {!sent && (
          <div className="border-t p-6">
            <Button className="w-full" disabled={!canSend} onClick={send}>
              {sending ? "Wysyłanie…" : "Wyślij zgłoszenie"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Zwykle odpowiadamy w ciągu 24 godzin w dni robocze.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
