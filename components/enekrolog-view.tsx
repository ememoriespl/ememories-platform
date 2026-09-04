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
  dateRange: string
  obituaryText: string
  ceremonyDateTime: string
  /** ISO timestamp of the ceremony, for the countdown. Null when no date is set. */
  ceremonyIso: string | null
  ceremonyInfo: string
  photo: string | null
  photoBw: boolean
  coverPhoto: string | null
  /** Optional image behind the whole card. */
  backgroundPhoto: string | null
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

/** eNekrolog-only images + avatar B&W choice, read from the `location` blob. */
export function parseEnekrologCover(
  locationRaw: string | null | undefined
): { coverPhoto: string | null; backgroundPhoto: string | null; photoBw: boolean } {
  if (!locationRaw) return { coverPhoto: null, backgroundPhoto: null, photoBw: false }
  try {
    const p = JSON.parse(locationRaw)
    return {
      coverPhoto: p?.coverPhoto ?? null,
      backgroundPhoto: p?.backgroundPhoto ?? null,
      photoBw: !!p?.enekrologPhotoBw,
    }
  } catch {
    return { coverPhoto: null, backgroundPhoto: null, photoBw: false }
  }
}

export function enekrologDateRange(birth: string | null | undefined, death: string | null | undefined): string {
  return [birth, death]
    .filter(Boolean)
    .map((d) => new Date(d as string).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }))
    .join(" — ")
}

/** "30 lipca 2026 r., godz. 12:00" — the ceremony date (+ optional time). */
export function enekrologCeremonyDateTime(date: string | null | undefined, time: string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const day = `${d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })} r.`
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
    <div
      className={cn("flex min-h-full flex-col bg-muted/20", className)}
      style={
        data.backgroundPhoto
          ? {
              backgroundImage: `url(${data.backgroundPhoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="flex-1 px-4 pb-6 pt-2">
        <div className="mx-auto w-full max-w-xl">
          {/* Obituary text sits above the card, directly on the background. */}
          {data.obituaryText && (
            <p className="mb-2 whitespace-pre-wrap px-4 py-2 text-center text-sm leading-relaxed">
              {data.obituaryText}
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* Cover banner — the portrait sits on it, dipping a little past its bottom edge.
                Aspect matches COVER_ASPECT (16/6) in the crop dialog so the crop is WYSIWYG.
                With no cover there is no banner at all, so the portrait moves up to the top of
                the card instead of leaving an empty white block above it. */}
            {data.coverPhoto && (
              <div className="w-full" style={{ aspectRatio: "16 / 6" }}>
                <img src={data.coverPhoto} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            {/* With no portrait the name simply moves up — no initials stand-in. The top
                padding then has to come from this block, since it normally rides on the
                portrait's own margin. */}
            <div
              className={`flex flex-col items-center px-8 pb-6 text-center ${
                data.photo ? "" : "pt-5"
              }`}
            >
              {data.photo && (
                <div className={data.coverPhoto ? "-mt-[100px]" : "mt-8"}>
                  <img
                    src={data.photo}
                    alt={data.fullName}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-card"
                    style={data.photoBw ? { filter: "grayscale(100%)" } : undefined}
                  />
                </div>
              )}
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{data.fullName}</h1>
              {data.dateRange && <p className="mt-1 text-sm text-muted-foreground">{data.dateRange}</p>}
            </div>

            <div className="space-y-5 px-8 pb-8">
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

              {/* Logo is desaturated + faded so the whole credit reads as one light grey line */}
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <span>eNekrolog wygenerowany przez</span>
                <LogoLight className="opacity-40 grayscale" style={{ height: 16, width: "auto" }} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Only the countdown / navigation bar is pinned; the credit line scrolls with the content.
          Opaque so the background image can't bleed through under it. */}
      <div className="sticky bottom-0 bg-background">
        <EnekrologNavBar ceremonyIso={data.ceremonyIso} addresses={data.addresses} />
      </div>
    </div>
  )
}
