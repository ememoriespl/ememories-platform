"use client"

import { useEffect, useRef, useState } from "react"
import { Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EnekrologAddress } from "@/components/enekrolog-view"

/** Slide duration for the navigation drawer, in ms (kept in sync with the CSS duration). */
const DRAWER_MS = 300

/** Directions link — opens the phone's navigation app (Google/Apple Maps) with the address. */
export function navigationUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/** "2 dni 5 godz. 43 min 12 s" — leading zero units are dropped. */
function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days} ${days === 1 ? "dzień" : "dni"}`)
  if (days > 0 || hours > 0) parts.push(`${hours} godz.`)
  if (days > 0 || hours > 0 || minutes > 0) parts.push(`${minutes} min`)
  parts.push(`${seconds} s`)
  return parts.join(" ")
}

/**
 * Sticky action bar above the eNekrolog footer: a live countdown to the ceremony and a
 * "Nawiguj" button that opens a drawer with the ceremony addresses.
 *
 * The drawer is positioned `fixed` without a portal on purpose — inside the editor's scaled
 * phone frame the transform makes the device box the containing block, so it stays in the
 * phone; on the public page it anchors to the viewport.
 */
export function EnekrologNavBar({
  ceremonyIso,
  addresses,
}: {
  ceremonyIso: string | null
  addresses: EnekrologAddress[]
}) {
  const [remaining, setRemaining] = useState<number | null>(null)
  // `mounted` keeps the drawer in the DOM while it slides out; `shown` drives the transform.
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!ceremonyIso) return
    const target = new Date(ceremonyIso).getTime()
    if (Number.isNaN(target)) return
    const tick = () => setRemaining(target - Date.now())
    tick() // client-only, so the server render never mismatches
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [ceremonyIso])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  // Flip to the shown state in a follow-up task, so the closed position is committed first and
  // the transition has a start value. Deliberately not requestAnimationFrame — that never fires
  // in a background tab, which would leave the drawer stuck off-screen.
  useEffect(() => {
    if (!mounted) return
    const id = setTimeout(() => setShown(true), 0)
    return () => clearTimeout(id)
  }, [mounted])

  function openDrawer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setMounted(true)
  }

  function closeDrawer() {
    setShown(false)
    closeTimer.current = setTimeout(() => {
      setMounted(false)
      closeTimer.current = null
    }, DRAWER_MS)
  }

  if (!ceremonyIso && addresses.length === 0) return null

  return (
    <>
      <div className="border-t bg-background px-4 py-3">
        {/* Same max width as the card above, so the bar lines up with the content on desktop */}
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          {ceremonyIso ? (
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Rozpoczęcie za…</p>
              <p className="truncate text-sm font-semibold tabular-nums">
                {remaining === null ? "—" : remaining > 0 ? formatCountdown(remaining) : "Ceremonia się odbyła"}
              </p>
            </div>
          ) : (
            <span />
          )}

          {addresses.length > 0 && (
            <Button className="shrink-0 gap-1.5" onClick={openDrawer}>
              <Navigation className="h-4 w-4" />
              Nawiguj
            </Button>
          )}
        </div>
      </div>

      {mounted && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none",
              shown ? "opacity-100" : "opacity-0"
            )}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t bg-background shadow-2xl",
              "transition-transform duration-300 ease-out motion-reduce:transition-none",
              shown ? "translate-y-0" : "translate-y-full"
            )}
            role="dialog"
            aria-label="Nawiguj do"
          >
            <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-4">
              <p className="text-sm font-semibold">Nawiguj do…</p>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Zamknij"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mx-auto w-full max-w-xl space-y-2 p-4 pb-6">
              {addresses.map((a) => (
                <a
                  key={a.key}
                  href={navigationUrl(a.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{a.label}</span>
                    <span className="block text-sm text-muted-foreground">{a.address}</span>
                  </span>
                  <Navigation className="h-5 w-5 shrink-0 text-primary" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
