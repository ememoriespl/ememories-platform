"use client"

import { StatusFilter, usePersistedFilter, matchesFilter, type StatusOption } from "@/components/status-filter"
import type { EffectiveStatus } from "@/lib/obituary-status"

export const STATUS_FILTER_OPTIONS: StatusOption<EffectiveStatus>[] = [
  { value: "draft", label: "Szkice" },
  { value: "published", label: "Opublikowane" },
  { value: "finished", label: "Zakończone" },
]

const ALLOWED = STATUS_FILTER_OPTIONS.map((o) => o.value)

export function usePersistedStatusFilter(storageKey: string) {
  return usePersistedFilter<EffectiveStatus>(storageKey, ALLOWED)
}

export function matchesStatusFilter(filter: EffectiveStatus[], status: EffectiveStatus) {
  return matchesFilter(filter, status)
}

export function ObituaryStatusFilter(props: {
  value: EffectiveStatus[]
  setValue: React.Dispatch<React.SetStateAction<EffectiveStatus[]>>
  onChanged?: () => void
}) {
  return <StatusFilter options={STATUS_FILTER_OPTIONS} {...props} />
}
