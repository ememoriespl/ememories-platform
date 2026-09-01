"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { LogoLight } from "@/components/logo"
import { DeclarationText } from "@/components/declaration-text"
import { DECLARATION_TITLE, DECLARATION_VERSION } from "@/lib/declaration"

/**
 * Blocks the obituary editor until the funeral home has accepted the current version of the
 * declaration. Administrators are not the declaring party, so the API reports nothing required
 * of them and the editor opens straight away.
 */
export function DeclarationGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)

  // A failing check must not pass silently: without a loud error a broken endpoint would look
  // exactly like "already accepted", and obituaries would be written with nothing on record.
  // It still fails open — an outage should not lock a funeral home out of its own work — but
  // it says so, because accepting would fail too until the cause is fixed.
  useEffect(() => {
    fetch("/api/declaration")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || `Błąd ${r.status}`)
        return r.json()
      })
      .then((d) => {
        if (d?.required && !d.accepted) setOpen(true)
      })
      .catch((err) => {
        console.error("Nie udało się sprawdzić oświadczenia:", err)
        toast.error("Nie udało się sprawdzić statusu oświadczenia. Odśwież stronę lub zgłoś nam problem.")
      })
  }, [])

  async function accept() {
    setSaving(true)
    try {
      const res = await fetch("/api/declaration", { method: "POST" })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Błąd ${res.status}`)
      setOpen(false)
    } catch (err) {
      toast.error(`Nie udało się zapisać oświadczenia: ${err instanceof Error ? err.message : "nieznany błąd"}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {children}
      {/* Deliberately not dismissible: leaving the editor is the only way past it. */}
      <Dialog open={open}>
        <DialogContent showCloseButton={false} className="p-8 sm:max-w-2xl">
          <DialogHeader>
            <LogoLight style={{ height: 32, width: "auto" }} className="mb-4 self-start" />
            <DialogTitle>{DECLARATION_TITLE}</DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            Wersja dokumentu: {DECLARATION_VERSION} ·{" "}
            <Link href="/oswiadczenie" target="_blank" className="underline hover:text-foreground">
              otwórz w nowej karcie
            </Link>
          </p>

          <div className="max-h-[45vh] overflow-y-auto rounded-xl border p-4">
            <DeclarationText />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              className="mt-0.5"
            />
            <span>
              Zapoznałem się z treścią oświadczenia i składam je w imieniu reprezentowanego zakładu
              pogrzebowego.
            </span>
          </label>

          <DialogFooter>
            <Button color="tertiary" onClick={() => router.push("/funeral-home/dashboard")}>
              Wróć do nekrologów
            </Button>
            <Button onClick={accept} disabled={!checked || saving}>
              {saving ? "Zapisywanie…" : "Akceptuję"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
