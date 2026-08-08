import { LogoLight } from "@/components/logo"
import { EnekrologNavBar } from "@/components/enekrolog-nav-bar"
import { cn } from "@/lib/utils"

export interface EnekrologAddress {
  key: string
  label: string
  address: string
}

export interface EnekrologData {
  fullName: string
  initials: string
  dateRange: string
  obituaryText: string
  ceremonyDateTime: string
  /** ISO timestamp of the ceremony, for the countdown. Null when no date is set. */
  ceremonyIso: string | null
  ceremonyInfo: string
  photo: string | null
  photoBw: boolean
  coverPhoto: string | null
  addresses: EnekrologAddress[]
}

const ADDRESS_LABELS: Record<string, string> = {
  church: "Kościół",
  funeralHome: "Dom pogrzebowy",
  cemetery: "Cmentarz",
}

/** Ceremony addresses from the serialized `location` blob, in display order, only enabled+filled. */
export function parseEnekrologAddresses(locationRaw: string | null | undefined): EnekrologAddress[] {
  if (!locationRaw) return []
  try {
    const p = JSON.parse(locationRaw)
    return (["church", "funeralHome", "cemetery"] as const)
      .filter((k) => p?.[k]?.enabled && p?.[k]?.address)
      .map((k) => ({ key: k, label: ADDRESS_LABELS[k], address: String(p[k].address) }))
  } catch {
    return []
  }
}

/** eNekrolog-only cover photo + avatar B&W choice, read from the `location` blob. */
export function parseEnekrologCover(locationRaw: string | null | undefined): { coverPhoto: string | null; photoBw: boolean } {
  if (!locationRaw) return { coverPhoto: null, photoBw: false }
  try {
    const p = JSON.parse(locationRaw)
    return { coverPhoto: p?.coverPhoto ?? null, photoBw: !!p?.enekrologPhotoBw }
  } catch {
    return { coverPhoto: null, photoBw: false }
  }
}

export function enekrologDateRange(birth: string | null | undefined, death: string | null | undefined): string {
  return [birth, death]
    .filter(Boolean)
    .map((d) => new Date(d as string).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }))
    .join(" — ")
}

/** "30 lipca 2026, godz. 12:00" — the ceremony date (+ optional time). */
export function enekrologCeremonyDateTime(date: string | null | undefined, time: string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const day = d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })
  return time ? `${day}, godz. ${time}` : day
}

/** Ceremony date/time stored in the `location` blob, formatted for display. */
export function parseEnekrologCeremonyDateTime(locationRaw: string | null | undefined): string {
  if (!locationRaw) return ""
  try {
    const p = JSON.parse(locationRaw)
    return enekrologCeremonyDateTime(p?.ceremonyDate, p?.ceremonyTime)
  } catch {
    return ""
  }
}

/** Ceremony moment as an ISO string (local time), for the countdown. */
export function enekrologCeremonyIso(date: string | null | undefined, time: string | null | undefined): string | null {
  if (!date) return null
  const iso = `${date}T${time || "00:00"}:00`
  return Number.isNaN(new Date(iso).getTime()) ? null : iso
}

/** Ceremony moment from the `location` blob, as an ISO string. */
export function parseEnekrologCeremonyIso(locationRaw: string | null | undefined): string | null {
  if (!locationRaw) return null
  try {
    const p = JSON.parse(locationRaw)
    return enekrologCeremonyIso(p?.ceremonyDate, p?.ceremonyTime)
  } catch {
    return null
  }
}

/**
 * The eNekrolog card (what a scanned QR opens). Used by both the public page and the
 * editor preview so they stay identical. The container it's placed in controls scrolling;
 * the footer sticks to the bottom of that container.
 */
export function EnekrologView({ data, className }: { data: EnekrologData; className?: string }) {
  return (
    <div className={cn("flex min-h-full flex-col bg-muted/20", className)}>
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto w-full max-w-xl">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* Cover banner — the avatar overlaps its bottom edge (cover reaches the avatar's middle).
                Aspect matches COVER_ASPECT (16/6) in the crop dialog so the crop is WYSIWYG. */}
            <div className="w-full bg-gradient-to-br from-muted to-muted/40" style={{ aspectRatio: "16 / 6" }}>
              {data.coverPhoto && <img src={data.coverPhoto} alt="" className="h-full w-full object-cover" />}
            </div>

            <div className="flex flex-col items-center px-8 pb-6 text-center">
              <div className="-mt-12">
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt={data.fullName}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-card"
                    style={data.photoBw ? { filter: "grayscale(100%)" } : undefined}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-semibold ring-4 ring-card">
                    {data.initials}
                  </div>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{data.fullName}</h1>
              {data.dateRange && <p className="mt-1 text-sm text-muted-foreground">{data.dateRange}</p>}
            </div>

            <div className="space-y-5 px-8 pb-8">
              {data.obituaryText && (
                <p className="whitespace-pre-wrap text-center text-sm leading-relaxed">{data.obituaryText}</p>
              )}

              {/* Addresses live only behind the "Nawiguj" button in the bottom bar, so they
                  aren't duplicated here. */}
              {(data.ceremonyDateTime || data.ceremonyInfo) && (
                <div className="space-y-4 border-t pt-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Ceremonia pożegnalna
                  </p>
                  {data.ceremonyDateTime && (
                    <p className="text-center text-base font-semibold text-foreground">{data.ceremonyDateTime}</p>
                  )}
                  {data.ceremonyInfo && (
                    <p className="whitespace-pre-wrap text-center text-sm text-muted-foreground">{data.ceremonyInfo}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Cyfrowy nekrolog wygenerowany przez</span>
            <LogoLight style={{ height: 16, width: "auto" }} />
          </p>
        </div>
      </div>

      {/* Only the countdown / navigation bar is pinned; the credit line scrolls with the content. */}
      <div className="sticky bottom-0">
        <EnekrologNavBar ceremonyIso={data.ceremonyIso} addresses={data.addresses} />
      </div>
    </div>
  )
}
