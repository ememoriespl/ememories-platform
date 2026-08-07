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
    initials: `${obit.first_name?.[0] ?? ""}${obit.last_name?.[0] ?? ""}`,
    dateRange: enekrologDateRange(obit.birth_date, obit.death_date),
    obituaryText: obit.obituary_text ?? "",
    ceremonyDateTime: parseEnekrologCeremonyDateTime(obit.location),
    ceremonyIso: parseEnekrologCeremonyIso(obit.location),
    ceremonyInfo: obit.ceremony_info ?? "",
    photo: obit.photo_url ?? null,
    photoBw: cover.photoBw,
    coverPhoto: cover.coverPhoto,
    addresses: parseEnekrologAddresses(obit.location),
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <EnekrologView data={data} className="flex-1" />
    </div>
  )
}
