"use client"

import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import type { EffectiveStatus } from "@/lib/obituary-status"

export const STATUS_FILTER_OPTIONS: { value: EffectiveStatus; label: string }[] = [
  { value: "draft", label: "Szkice" },
  { value: "published", label: "Opublikowane" },
  { value: "finished", label: "Zakończone" },
]

/**
 * Multi-select status filter state, persisted so the selection survives navigating
 * away and back. An empty array means "no filter" — i.e. show everything.
 */
export function usePersistedStatusFilter(storageKey: string) {
  const [value, setValue] = useState<EffectiveStatus[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
      const allowed = STATUS_FILTER_OPTIONS.map((o) => o.value)
      return Array.isArray(raw) ? raw.filter((s): s is EffectiveStatus => allowed.includes(s)) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [storageKey, value])

  return [value, setValue] as const
}

/** True when the row's effective status passes the given filter. */
export function matchesStatusFilter(filter: EffectiveStatus[], status: EffectiveStatus) {
  return filter.length === 0 || filter.includes(status)
}

export function ObituaryStatusFilter({
  value,
  setValue,
  onChanged,
}: {
  value: EffectiveStatus[]
  /** State setter — updates are functional so rapid toggles can't clobber each other. */
  setValue: React.Dispatch<React.SetStateAction<EffectiveStatus[]>>
  /** Called after any change, e.g. to reset pagination. */
  onChanged?: () => void
}) {
  function toggle(v: EffectiveStatus) {
    setValue((prev) => {
      const next = prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]
      // Selecting every status is the same as no filter — collapse to "Wszystkie".
      return next.length === STATUS_FILTER_OPTIONS.length ? [] : next
    })
    onChanged?.()
  }

  function reset() {
    setValue([])
    onChanged?.()
  }

  const label =
    value.length === 0
      ? "Wszystkie"
      : value.length === 1
        ? STATUS_FILTER_OPTIONS.find((o) => o.value === value[0])?.label ?? "Wszystkie"
        : `${value.length} statusy`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-40 items-center justify-between rounded-lg border bg-background px-3 text-sm outline-none transition-colors hover:bg-muted/50">
        <span className="truncate">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuCheckboxItem checked={value.length === 0} onCheckedChange={reset}>
          Wszystkie
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
