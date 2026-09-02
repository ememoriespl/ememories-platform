"use client"

import { useEffect, useState } from "react"
import { Loader2, Paperclip, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
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
const SENT_KEY = "support-sent"
const MAX_UPLOAD_MB = 4

/** Only the prompt changes with the kind; the field is the same single description. */
const BODY_PLACEHOLDER: Record<TicketKind, string> = {
  bug: "Kliknąłem „Pobierz .pdf”, dostałem pusty plik. Spodziewałem się nekrologu na jednej stronie.",
  idea: "Za każdym razem wpisujemy podobną treść od zera. Zajmuje to kilka minut przy każdym nekrologu.",
  question: "Czy kod QR działa, zanim opublikuję nekrolog?",
}

/** The list needs a headline and the reporter should not have to write one twice. */
function deriveTitle(description: string): string {
  const firstLine = description.trim().split("\n")[0].trim()
  return firstLine.length > 80 ? `${firstLine.slice(0, 79).trimEnd()}…` : firstLine
}

interface Draft {
  kind?: TicketKind
  description?: string
}

/** The last receipt, kept so closing the drawer — or reloading — does not lose the reference
 *  number. Cleared only when the reporter starts a new report. */
function readSent(): Ticket | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SENT_KEY)
    return raw ? (JSON.parse(raw) as Ticket) : null
  } catch {
    return null
  }
}

/** An unsent draft: a network failure or a mis-click must not cost what the reporter typed. */
function readDraft(): Draft {
  if (typeof window === "undefined") return {}
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}")
    return {
      kind: TICKET_KINDS.includes(d?.kind) ? d.kind : undefined,
      description: typeof d?.description === "string" ? d.description : undefined,
    }
  } catch {
    return {}
  }
}

/** Gathered at send time and attached to the ticket. Not shown to the reporter — it is noise
 * for them and useful only to whoever picks the ticket up. */
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
  const [description, setDescription] = useState(draft.description ?? "")
  const [email, setEmail] = useState("")
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<Ticket | null>(readSent)
  const [history, setHistory] = useState<Ticket[]>([])
  const [tab, setTab] = useState("new")

  useEffect(() => {
    if (sent) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ kind, description }))
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [kind, description, sent])

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
          title: deriveTitle(description),
          description,
          // No email field: it is not editable, so the server uses the signed-in address.
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
        localStorage.setItem(SENT_KEY, JSON.stringify(ticket))
      } catch {
        // ignore storage failures (private mode, quota)
      }
    } catch (err) {
      toast.error(`Nie udało się wysłać zgłoszenia: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    } finally {
      setSending(false)
    }
  }

  /** Clearing is its own step, so closing never costs what is on screen — reopening shows
   *  whatever was left behind, whether a receipt or a half-written report. */
  function reset() {
    setSent(null)
    setKind(null)
    setDescription("")
    setFiles([])
    try {
      localStorage.removeItem(SENT_KEY)
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }

  const canSend = !!kind && description.trim().length > 0 && !sending && !uploading

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b p-6">
          <SheetTitle>Zgłoszenie</SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v ?? "new")} className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="new">Nowe zgłoszenie</TabsTrigger>
              <TabsTrigger value="mine">Moje zgłoszenia</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new" className="min-h-0 flex-1 overflow-y-auto p-6">
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

              <div className="flex items-center gap-4">
                <Button color="secondary" onClick={() => onOpenChange(false)}>
                  Zamknij
                </Button>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Napisz kolejne
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Address first: it is where the answer goes, and it is not the reporter's to change. */}
              <div className="space-y-1.5">
                <Label htmlFor="ticket-email">Adres e-mail</Label>
                <Input
                  id="ticket-email"
                  value={email}
                  readOnly
                  className="bg-muted/40 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Odpowiedź wyślemy na ten adres.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-kind">Temat</Label>
                <Select value={kind} onValueChange={(v) => setKind((v as TicketKind) ?? null)}>
                  <SelectTrigger id="ticket-kind" className="w-full">
                    {kind ? (
                      <span>{TICKET_KIND_META[kind].label}</span>
                    ) : (
                      <span className="text-muted-foreground">Wybierz…</span>
                    )}
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {TICKET_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {TICKET_KIND_META[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {kind && <p className="text-xs text-muted-foreground">{TICKET_KIND_META[kind].hint}</p>}
              </div>

              {/* The prompt depends on the subject, so these wait until it is chosen. */}
              {kind && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-body">Opis</Label>
                    <Textarea
                      id="ticket-body"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={BODY_PLACEHOLDER[kind]}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Załącznik</Label>
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
                </>
              )}
            </div>
          )}
          </TabsContent>

          <TabsContent value="mine" className="min-h-0 flex-1 overflow-y-auto p-6">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych zgłoszeń.</p>
            ) : (
              <ul className="divide-y">
                {history.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <Badge variant={TICKET_STATUS_META[t.status as TicketStatus]?.variant ?? "gray"}>
                      {TICKET_STATUS_META[t.status as TicketStatus]?.label ?? t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        {tab === "new" && !sent && (
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
