// Effective (displayed) obituary status. There are three states:
//   draft      — anything not yet published (incl. legacy "archived" rows)
//   published  — published and the ceremony hasn't finished (>24h ago)
//   finished   — published and it's been more than 24h since the ceremony
//
// "finished" is derived, not stored: the DB status stays "published" (the public
// page and the credit/limit count still treat it as published), we only relabel it
// once the ceremony is a day past. This avoids needing a scheduled job.

export type EffectiveStatus = "draft" | "published" | "finished"

export const STATUS_META: Record<EffectiveStatus, { label: string; variant: "success" | "gray" | "outline" }> = {
  draft: { label: "Szkic", variant: "outline" },
  published: { label: "Opublikowany", variant: "success" },
  finished: { label: "Zakończony", variant: "gray" },
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Ceremony date ("YYYY-MM-DD") and time ("HH:mm") pulled from the serialized `location` blob. */
export function parseCeremony(location: string | null | undefined): { ceremonyDate: string; ceremonyTime: string } {
  if (!location) return { ceremonyDate: "", ceremonyTime: "" }
  try {
    const p = JSON.parse(location)
    return { ceremonyDate: p?.ceremonyDate ?? "", ceremonyTime: p?.ceremonyTime ?? "" }
  } catch {
    return { ceremonyDate: "", ceremonyTime: "" }
  }
}

/** True once it's been more than 24h since the ceremony (date + optional time). */
export function isCeremonyFinished(ceremonyDate: string, ceremonyTime = ""): boolean {
  if (!ceremonyDate) return false
  const iso = ceremonyTime ? `${ceremonyDate}T${ceremonyTime}:00` : `${ceremonyDate}T00:00:00`
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() > t + DAY_MS
}

export function effectiveStatus(
  storedStatus: string | undefined | null,
  ceremonyDate: string,
  ceremonyTime = ""
): EffectiveStatus {
  if (storedStatus !== "published") return "draft"
  return isCeremonyFinished(ceremonyDate, ceremonyTime) ? "finished" : "published"
}

/** Convenience for table rows that carry the raw `location` blob. */
export function effectiveStatusFromRow(row: { status?: string | null; location?: string | null }): EffectiveStatus {
  const { ceremonyDate, ceremonyTime } = parseCeremony(row.location)
  return effectiveStatus(row.status, ceremonyDate, ceremonyTime)
}
