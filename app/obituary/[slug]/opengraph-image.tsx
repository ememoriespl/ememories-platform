import { ImageResponse } from "next/og"
import { createServerClient } from "@/lib/supabase"
import { parseEnekrologCover } from "@/components/enekrolog-view"

export const alt = "eNekrolog"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Portrait takes 80% of the canvas height, vertically centred, straddling the cover's edge. */
const AVATAR = Math.round(size.height * 0.8)
const AVATAR_INNER = AVATAR - 24
const AVATAR_TOP = Math.round((size.height - AVATAR) / 2)
const COVER_H = AVATAR_TOP + AVATAR / 2

/**
 * Link preview for a shared eNekrolog: the cover banner with the portrait overlapping its
 * bottom edge, mirroring the top of the eNekrolog card.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = createServerClient()
  const { data: obit } = await supabase
    .from("obituaries")
    .select("first_name, last_name, photo_url, location")
    .eq("id", slug)
    .eq("status", "published")
    .single()

  const cover = obit ? parseEnekrologCover(obit.location).coverPhoto : null
  const photo = obit?.photo_url ?? null
  const initials = obit ? `${obit.first_name?.[0] ?? ""}${obit.last_name?.[0] ?? ""}`.toUpperCase() : ""

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#ffffff" }}>
        {/* Cover banner */}
        <div style={{ position: "absolute", top: 0, left: 0, width: size.width, height: COVER_H, display: "flex" }}>
          {cover ? (
            <img src={cover} width={size.width} height={COVER_H} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ width: size.width, height: COVER_H, display: "flex", background: "#eceef1" }} />
          )}
        </div>

        {/* Portrait, straddling the cover's bottom edge */}
        <div
          style={{
            position: "absolute",
            top: AVATAR_TOP,
            left: (size.width - AVATAR) / 2,
            width: AVATAR,
            height: AVATAR,
            borderRadius: AVATAR / 2,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            <img
              src={photo}
              width={AVATAR_INNER}
              height={AVATAR_INNER}
              style={{ borderRadius: AVATAR_INNER / 2, objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: AVATAR_INNER,
                height: AVATAR_INNER,
                borderRadius: AVATAR_INNER / 2,
                background: "#f1f2f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 96,
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>
    ),
    size
  )
}
