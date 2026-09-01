"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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

  useEffect(() => {
    fetch("/api/declaration")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.required && !d.accepted) setOpen(true)
      })
      .catch(() => {})
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
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogHeader>
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
