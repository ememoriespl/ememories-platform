"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface StatusOption<T extends string> {
  value: T
  label: string
}

/**
 * Multi-select status filter state, persisted so the selection survives navigating away and
 * back. An empty array means "no filter" — i.e. show everything. `allowed` guards against a
 * stored value that no longer exists after the options change.
 */
export function usePersistedFilter<T extends string>(storageKey: string, allowed: readonly T[]) {
  const [value, setValue] = useState<T[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? "[]")
      return Array.isArray(raw) ? raw.filter((s): s is T => allowed.includes(s)) : []
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

/** True when the row's status passes the given filter. */
export function matchesFilter<T extends string>(filter: T[], status: T) {
  return filter.length === 0 || filter.includes(status)
}

export function StatusFilter<T extends string>({
  options,
  value,
  setValue,
  onChanged,
  allLabel = "Wszystkie",
}: {
  options: readonly StatusOption<T>[]
  value: T[]
  /** State setter — updates are functional so rapid toggles can't clobber each other. */
  setValue: React.Dispatch<React.SetStateAction<T[]>>
  /** Called after any change, e.g. to reset pagination. */
  onChanged?: () => void
  allLabel?: string
}) {
  function toggle(v: T) {
    setValue((prev) => {
      const next = prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]
      // Selecting every status is the same as no filter — collapse to "Wszystkie".
      return next.length === options.length ? [] : next
    })
    onChanged?.()
  }

  function reset() {
    setValue([])
    onChanged?.()
  }

  const label =
    value.length === 0
      ? allLabel
      : value.length === 1
        ? options.find((o) => o.value === value[0])?.label ?? allLabel
        : `${value.length} statusy`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-40 items-center justify-between rounded-lg border bg-background px-3 text-sm outline-none transition-colors hover:bg-muted/50">
        <span className="truncate">{label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuCheckboxItem checked={value.length === 0} onCheckedChange={reset}>
          {allLabel}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
