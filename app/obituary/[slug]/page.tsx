import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import {
  EnekrologView,
  parseEnekrologAddresses,
  parseEnekrologCover,
  parseEnekrologCeremonyDateTime,
  parseEnekrologCeremonyIso,
  enekrologDateRange,
  type EnekrologData,
} from "@/components/enekrolog-view"

interface Props {
  params: Promise<{ slug: string }>
}

/** Append a full stop unless the text already ends with punctuation, so fragments join cleanly. */
function sentence(text: string | null | undefined): string | null {
  const t = text?.trim()
  if (!t) return null
  return /[.!?…]$/.test(t) ? t : `${t}.`
}

/** Cut to `max` characters on a word boundary, so descriptions don't end mid-word. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, "")}…`
}

/**
 * Link preview shown by messengers and social networks. The image itself comes from the
 * `opengraph-image` route in this segment, which Next wires up automatically.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: obit } = await supabase
    .from("obituaries")
    .select("first_name, last_name, birth_date, death_date, obituary_text, ceremony_info, location")
    .eq("id", slug)
    .eq("status", "published")
    .single()

  if (!obit) return { title: "eNekrolog" }

  const fullName = `${obit.first_name} ${obit.last_name}`.trim()
  const title = `eNekrolog - ${fullName}`

  // Compose a description long enough to be useful in previews and search results:
  // the obituary text, the life dates, and when the ceremony takes place.
  const dates = enekrologDateRange(obit.birth_date, obit.death_date)
  const ceremony = parseEnekrologCeremonyDateTime(obit.location)
  const description = truncate(
    [
      dates ? `${fullName} (${dates}).` : `${fullName}.`,
      sentence(obit.obituary_text),
      ceremony ? `Ceremonia pożegnalna: ${ceremony}.` : sentence(obit.ceremony_info),
    ]
      .filter(Boolean)
      .join(" "),
    155
  )

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      siteName: "eMemories",
      title,
      description,
      url: `/obituary/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function PublicObituaryPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: obit, error } = await supabase
    .from("obituaries")
    .select("*")
    .eq("id", slug)
    .eq("status", "published")
    .single()

  if (error || !obit) notFound()

  // Increment views (fire and forget)
  supabase
    .from("obituaries")
    .update({ views: obit.views + 1 })
    .eq("id", slug)
    .then(() => {})

  const cover = parseEnekrologCover(obit.location)
  const data: EnekrologData = {
    fullName: `${obit.first_name} ${obit.last_name}`,
    dateRange: enekrologDateRange(obit.birth_date, obit.death_date),
    obituaryText: obit.obituary_text ?? "",
    ceremonyDateTime: parseEnekrologCeremonyDateTime(obit.location),
    ceremonyIso: parseEnekrologCeremonyIso(obit.location),
    ceremonyInfo: obit.ceremony_info ?? "",
    photo: obit.photo_url ?? null,
    photoBw: cover.photoBw,
    coverPhoto: cover.coverPhoto,
    backgroundPhoto: cover.backgroundPhoto,
    addresses: parseEnekrologAddresses(obit.location),
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <EnekrologView data={data} className="flex-1" />
    </div>
  )
}
