import { MapPin } from "lucide-react"
import { LogoLight } from "@/components/logo"
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

              {(data.ceremonyInfo || data.addresses.length > 0) && (
                <div className="space-y-4 border-t pt-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Ceremonia pożegnalna
                  </p>
                  {data.ceremonyInfo && (
                    <p className="whitespace-pre-wrap text-center text-sm text-muted-foreground">{data.ceremonyInfo}</p>
                  )}
                  {data.addresses.length > 0 && (
                    <div className="space-y-2">
                      {data.addresses.map((a) => (
                        <a
                          key={a.key}
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-accent"
                        >
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{a.label}</span>
                            <span className="block text-sm text-muted-foreground">{a.address}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Cyfrowy nekrolog wygenerowany przez</span>
          <LogoLight style={{ height: 16, width: "auto" }} />
        </div>
      </footer>
    </div>
  )
}
