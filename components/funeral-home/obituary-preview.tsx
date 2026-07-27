"use client"

import { useId, useState } from "react"
import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"
import { ZoomIn } from "lucide-react"
import { PRINT_FONTS_CLASSNAME, getPrintFontFamily, DEFAULT_PRINT_FONT_ID } from "@/lib/print-fonts"
import { getSigilOption, DEFAULT_SIGIL_ID, DEFAULT_SIGIL_COLOR } from "@/lib/print-sigils"
import { SIGIL_ICON_DATA } from "@/lib/sigil-icons"
import { FRAME_ART_DATA } from "@/lib/frame-art"
import { WATERMARK_VIEWBOX, WATERMARK_INNER_HTML } from "@/lib/watermark"
import { EMEMORIES_MARK_VIEWBOX, EMEMORIES_MARK_INNER_HTML } from "@/lib/ememories-mark"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface PreviewData {
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  obituaryHeadline: string
  obituaryText: string
  ceremonyInfo: string
  preparedByText: string
  ceremonyDate: string
  ceremonyTime: string
  photo: string | null
  photoBw: boolean
}

export type ContentBlockId = "photo" | "sigil" | "sp" | "name" | "dates" | "headline" | "body" | "ceremonyLabel" | "ceremonyDateTime" | "ceremony" | "ceremonyBy"
export type GraphicItemId = "photo" | "sigil" | "qr"

export type BlockAlign = "left" | "center" | "right"
export type VerticalAlign = "top" | "center" | "bottom" | "distribute"

export interface BlockSettings {
  size: number
  align: BlockAlign
  marginTop: number
  marginBottom: number
  fontId?: string
  fontWeight?: number
  italic?: boolean
  uppercase?: boolean
  enabled?: boolean
  text?: string
  sigilId?: string
  color?: string
  /** "ceremony" block only: show the eNekrolog QR code inline, to the left of the ceremony text */
  qrEnabled?: boolean
  qrSize?: number
  qrGap?: number
}

export interface GraphicItemSettings {
  enabled: boolean
  align: BlockAlign
  marginTop: number
  marginBottom: number
  size: number
  sigilId?: string
  color?: string
}

export type FrameStyle =
  | "none"
  | "cienka-linia"
  | "gruba-linia"
  | "podwojna-linia"
  | "naroznik-otwarty"
  | "rogi-ozdobne"
  | "ozdobna-fala"

export interface FrameSettings {
  style: FrameStyle
  color: string
}

export const FRAME_STYLE_OPTIONS: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "Brak" },
  { id: "cienka-linia", label: "Cienka linia" },
  { id: "gruba-linia", label: "Gruba linia" },
  { id: "podwojna-linia", label: "Podwójna linia" },
  { id: "naroznik-otwarty", label: "Otwarte narożniki" },
  { id: "rogi-ozdobne", label: "Rogi ozdobne" },
  { id: "ozdobna-fala", label: "Ozdobna fala" },
]

export const DEFAULT_FRAME_COLOR = "#333333"

export interface PrintTemplateSettings {
  fontId: string
  fontWeight: number
  columnPosition: "left" | "right"
  graphicColumnEnabled: boolean
  verticalAlign: VerticalAlign
  /** vertical alignment of the graphic column's own items, independent of the content column's */
  graphicVerticalAlign: VerticalAlign
  /** master switch for the eNekrolog QR code; when on it renders inline next to the ceremony
   *  text in the content column, when off it renders nowhere and the ceremony text is full-width */
  qrEnabled: boolean
  /** @deprecated the QR now always lives in the content column; kept so older saved templates still parse */
  qrLocation?: "graphic" | "content"
  /** inset (px) applied to the whole two-column content area, on top of each column's own padding — pulls content in from the page edge to clear the frame */
  pagePadding: number
  /** gap (px) between the graphic column and the content column */
  columnGap: number
  blockOrder: ContentBlockId[]
  blocks: Record<ContentBlockId, BlockSettings>
  graphicOrder: GraphicItemId[]
  graphicItems: Record<GraphicItemId, GraphicItemSettings>
  frame: FrameSettings
}

export const DEFAULT_BLOCK_ORDER: ContentBlockId[] = ["photo", "sigil", "sp", "name", "dates", "headline", "body", "ceremonyLabel", "ceremonyDateTime", "ceremony", "ceremonyBy"]
export const DEFAULT_GRAPHIC_ORDER: GraphicItemId[] = ["photo", "sigil"]

/** Ceremony blocks that group with the inline QR code when it sits in the content column
 *  — including "Przygotowane przez", so it aligns to the ceremony column, not the full width. */
const CEREMONY_GROUP_IDS = new Set<ContentBlockId>(["ceremonyLabel", "ceremonyDateTime", "ceremony", "ceremonyBy"])

/** "Portrait" blocks that share a column beside the photo, so they align to each other. */
const PHOTO_GROUP_IDS = new Set<ContentBlockId>(["sigil", "sp", "name", "dates", "headline", "body"])

export const DEFAULT_PRINT_TEMPLATE: PrintTemplateSettings = {
  fontId: DEFAULT_PRINT_FONT_ID,
  fontWeight: 400,
  columnPosition: "left",
  graphicColumnEnabled: true,
  verticalAlign: "center",
  graphicVerticalAlign: "top",
  qrEnabled: true,
  pagePadding: 0,
  columnGap: 0,
  blockOrder: DEFAULT_BLOCK_ORDER,
  blocks: {
    photo: { size: 130, align: "center", marginTop: 0, marginBottom: 20, enabled: true },
    sigil: { size: 64, align: "center", marginTop: 0, marginBottom: 20, enabled: false, sigilId: DEFAULT_SIGIL_ID, color: DEFAULT_SIGIL_COLOR },
    sp: { size: 14, align: "center", marginTop: 0, marginBottom: 8, enabled: true, text: "Ś.P." },
    name: { size: 22, align: "center", marginTop: 0, marginBottom: 8, fontWeight: 700 },
    dates: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    headline: { size: 13, align: "center", marginTop: 0, marginBottom: 24, italic: true },
    body: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    ceremonyLabel: { size: 20, align: "center", marginTop: 0, marginBottom: 6, fontWeight: 600 },
    ceremonyDateTime: { size: 12, align: "center", marginTop: 0, marginBottom: 4, italic: true },
    ceremony: { size: 11, align: "center", marginTop: 0, marginBottom: 0, italic: true, qrEnabled: false, qrSize: 64, qrGap: 16 },
    ceremonyBy: { size: 9, align: "center", marginTop: 20, marginBottom: 0, enabled: true },
  },
  graphicOrder: DEFAULT_GRAPHIC_ORDER,
  graphicItems: {
    photo: { enabled: false, align: "center", marginTop: 0, marginBottom: 20, size: 120 },
    sigil: { enabled: true, align: "center", marginTop: 0, marginBottom: 24, size: 32, sigilId: DEFAULT_SIGIL_ID, color: DEFAULT_SIGIL_COLOR },
    qr: { enabled: true, align: "center", marginTop: 0, marginBottom: 0, size: 72 },
  },
  frame: { style: "none", color: DEFAULT_FRAME_COLOR },
}

const VERTICAL_ALIGN_MAP: Record<VerticalAlign, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
  distribute: "space-between",
}

const HORIZONTAL_ALIGN_MAP: Record<BlockAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
}

// A4 landscape: 297mm × 210mm at 96dpi ≈ 1123 × 794
const A4_W = 1123
const A4_H = 794

export function renderFrame(frame: FrameSettings): React.ReactNode {
  const { color, style } = frame
  if (style === "none") return null
  const art = FRAME_ART_DATA[style]
  if (!art) return null
  return (
    <svg
      viewBox={art.viewBox}
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      fill={art.mode === "fill" ? color : "none"}
      stroke={art.mode === "stroke" ? color : "none"}
      dangerouslySetInnerHTML={{ __html: art.innerHTML }}
    />
  )
}

// Repeating "eMemories" watermark tiled across the whole A4 page, shown on drafts.
// Uses a native SVG <pattern> fill (same approach as renderFrame) so it survives
// Chromium's print/PDF export, unlike a CSS background-image. `id` must be unique
// per rendered instance (pass a useId()).
export function renderWatermark(id: string): React.ReactNode {
  const clipId = `${id}-clip`
  const inner = WATERMARK_INNER_HTML.replaceAll("ememories_wm_clip", clipId)
  const tileW = 210
  const tileH = 186
  return (
    <svg
      viewBox={`0 0 ${A4_W} ${A4_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={tileW}
          height={tileH}
          viewBox={WATERMARK_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          dangerouslySetInnerHTML={{ __html: inner }}
        />
      </defs>
      <rect width={A4_W} height={A4_H} fill={`url(#${id})`} />
    </svg>
  )
}

function safeFormat(dateStr: string, fmt: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00")
    if (!isValid(d)) return "—"
    return format(d, fmt, { locale: pl })
  } catch {
    return "—"
  }
}

function fontStyleFor(block: BlockSettings): React.CSSProperties {
  const style: React.CSSProperties = {}
  if (block.fontId) style.fontFamily = getPrintFontFamily(block.fontId)
  if (block.fontWeight !== undefined) style.fontWeight = block.fontWeight
  style.fontStyle = block.italic ? "italic" : "normal"
  style.textTransform = block.uppercase ? "uppercase" : "none"
  return style
}

function renderSigil(sigilId: string, size: number, color: string): React.ReactNode {
  const option = getSigilOption(sigilId)
  if (option.kind === "text") {
    return <div style={{ fontSize: size, color, lineHeight: 1 }}>{option.char}</div>
  }
  const icon = SIGIL_ICON_DATA[sigilId]
  if (!icon) return null
  // Inline real SVG paths with a fill attribute instead of a CSS mask-image: Chromium silently
  // drops mask-image when printing/exporting to PDF, but native SVG fill prints correctly.
  return (
    <svg
      viewBox={icon.viewBox}
      width={size * icon.aspect}
      height={size}
      fill={color}
      dangerouslySetInnerHTML={{ __html: icon.innerHTML }}
    />
  )
}

/**
 * Circular portrait. Renders the uploaded photo when present, otherwise a generic
 * person-silhouette avatar so a photo-enabled template still shows a placeholder.
 */
function renderPhoto(photo: string | null, size: number, bw: boolean): React.ReactNode {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          filter: bw ? "grayscale(100%)" : "none",
        }}
      />
    )
  }
  // Outline avatar (ring + head + shoulders), all strokes so it prints in Chromium PDF export.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="#141414"
      strokeWidth={2.4}
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <circle cx="24" cy="24" r="21.5" />
      <circle cx="24" cy="19" r="6.4" />
      <path d="M7.9 37.5 C 7.9 29 40.1 29 40.1 37.5" />
    </svg>
  )
}

/** eNekrolog QR code (fetched at ecc=H) with the eMemories sygnet inset in the centre. */
function renderQrImage(url: string, size: number): React.ReactNode {
  // ~22% of the code width — small enough for ecc=H to reconstruct the covered modules.
  const logo = Math.round(size * 0.22)
  const pad = Math.max(1, Math.round(logo * 0.14))
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <img src={url} alt="Kod QR do eNekrologu" width={size} height={size} style={{ display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: logo,
          height: logo,
          background: "#fff",
          borderRadius: Math.round(logo * 0.18),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: pad,
          boxSizing: "border-box",
        }}
      >
        <svg
          viewBox={EMEMORIES_MARK_VIEWBOX}
          width="100%"
          height="100%"
          fill="#141414"
          dangerouslySetInnerHTML={{ __html: EMEMORIES_MARK_INNER_HTML }}
        />
      </div>
    </div>
  )
}

export function ObituaryPreview({
  data,
  availableWidth,
  template = DEFAULT_PRINT_TEMPLATE,
  publicUrl,
  bare = false,
  watermarked = false,
}: {
  data: PreviewData
  availableWidth?: number
  template?: PrintTemplateSettings
  publicUrl?: string
  /** Renders just the A4 page at natural size with no preview chrome (label, border, scaling) — used for printing. */
  bare?: boolean
  /** Overlays the repeating draft watermark across the page (preview + print). */
  watermarked?: boolean
}) {
  const [zoomOpen, setZoomOpen] = useState(false)
  const watermarkId = useId()
  const scale = availableWidth && availableWidth > 0 ? availableWidth / A4_W : 0.5
  const zoomScale = Math.min(1000 / A4_W, 1)

  const hasName = data.firstName || data.lastName
  const name = hasName ? `${data.firstName} ${data.lastName}`.trim() : "Imię Nazwisko"
  const birthFmt = data.birthDate ? safeFormat(data.birthDate, "d MMMM yyyy") : null
  const deathFmt = data.deathDate ? safeFormat(data.deathDate, "d MMMM yyyy") : null
  const ceremonyDateFmt = data.ceremonyDate ? safeFormat(data.ceremonyDate, "d MMMM yyyy") : null
  const dateLine = birthFmt && deathFmt ? `${birthFmt} — ${deathFmt}` : birthFmt ? `ur. ${birthFmt}` : deathFmt ? `zm. ${deathFmt}` : "—"

  const cardWidth = availableWidth ?? Math.round(A4_W * scale)
  const fontFamily = getPrintFontFamily(template.fontId)
  const g = template.graphicItems
  const b = template.blocks
  const showCeremony = !!(ceremonyDateFmt || data.ceremonyInfo)
  const ceremonyQrSize = b.ceremony.qrSize ?? 64
  // ecc=H (30% error correction) keeps the code scannable with the sygnet logo over its centre.
  const ceremonyQrImageUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${ceremonyQrSize * 2}x${ceremonyQrSize * 2}&margin=8&ecc=H&data=${encodeURIComponent(publicUrl)}`
    : null

  const blocks: Partial<Record<ContentBlockId, React.ReactNode>> = {
    // Only a real uploaded photo renders in the content column; with no photo the name
    // takes the full width (no placeholder). The photo is grouped into the name row below.
    photo:
      b.photo.enabled !== false && data.photo ? (
        <div style={{ display: "flex", justifyContent: HORIZONTAL_ALIGN_MAP[b.photo.align] }}>
          {renderPhoto(data.photo, b.photo.size, data.photoBw)}
        </div>
      ) : null,
    sigil: b.sigil.enabled ? (
      <div style={{ display: "flex", justifyContent: HORIZONTAL_ALIGN_MAP[b.sigil.align] }}>
        {renderSigil(b.sigil.sigilId ?? DEFAULT_SIGIL_ID, b.sigil.size, b.sigil.color ?? DEFAULT_SIGIL_COLOR)}
      </div>
    ) : null,
    sp:
      b.sp.enabled && b.sp.text?.trim() ? (
        <p style={{ fontSize: b.sp.size, textAlign: b.sp.align, lineHeight: 1.4, ...fontStyleFor(b.sp) }}>{b.sp.text}</p>
      ) : null,
    name: (
      <h1
        style={{
          fontSize: b.name.size,
          textAlign: b.name.align,
          lineHeight: 1.12,
          opacity: hasName ? 1 : 0.25,
          ...fontStyleFor(b.name),
        }}
      >
        {name}
      </h1>
    ),
    dates: (
      <p style={{ fontSize: b.dates.size, textAlign: b.dates.align, color: "#666", lineHeight: 1.6, ...fontStyleFor(b.dates) }}>
        {dateLine}
      </p>
    ),
    headline: data.obituaryHeadline ? (
      <p
        style={{
          fontSize: b.headline.size,
          textAlign: b.headline.align,
          lineHeight: 1.75,
          color: "#333",
          whiteSpace: "pre-wrap",
          ...fontStyleFor(b.headline),
        }}
      >
        {data.obituaryHeadline}
      </p>
    ) : null,
    body: (
      <p
        style={{
          fontSize: b.body.size,
          textAlign: b.body.align,
          lineHeight: 1.85,
          color: "#222",
          whiteSpace: "pre-wrap",
          ...fontStyleFor(b.body),
        }}
      >
        {data.obituaryText || ""}
      </p>
    ),
    ceremonyLabel: showCeremony ? (
      <p
        style={{
          fontSize: b.ceremonyLabel.size,
          textAlign: b.ceremonyLabel.align,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#888",
          ...fontStyleFor(b.ceremonyLabel),
        }}
      >
        Ceremonia pogrzebowa
      </p>
    ) : null,
    ceremonyDateTime: ceremonyDateFmt ? (
      <p style={{ fontSize: b.ceremonyDateTime.size, textAlign: b.ceremonyDateTime.align, color: "#222", ...fontStyleFor(b.ceremonyDateTime) }}>
        {ceremonyDateFmt}
        {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
      </p>
    ) : null,
    ceremony: data.ceremonyInfo ? (
      <p
        style={{
          fontSize: b.ceremony.size,
          textAlign: b.ceremony.align,
          lineHeight: 1.6,
          color: "#555",
          whiteSpace: "pre-wrap",
          ...fontStyleFor(b.ceremony),
        }}
      >
        {data.ceremonyInfo}
      </p>
    ) : null,
    ceremonyBy:
      b.ceremonyBy.enabled && data.preparedByText.trim() ? (
        <p
          style={{
            fontSize: b.ceremonyBy.size,
            textAlign: b.ceremonyBy.align,
            color: "#999",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            ...fontStyleFor(b.ceremonyBy),
          }}
        >
          {data.preparedByText}
        </p>
      ) : null,
  }

  // The "headline" block is a removed feature; never render it, even for older
  // obituaries that still carry a saved headline value.
  const orderedBlocks = template.blockOrder
    .map((id) => ({ id, node: blocks[id] }))
    .filter((item) => item.id !== "headline" && item.node !== null)

  // "Ceremonia" can show the eNekrolog QR code inline; when the "Etykieta" block directly precedes it,
  // both are grouped into a single row so the QR forms one column and the label+ceremony text the other.
  const ceremonyQrNode =
    template.qrEnabled && ceremonyQrImageUrl ? (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        {renderQrImage(ceremonyQrImageUrl, ceremonyQrSize)}
        <p style={{ fontSize: 7, color: "#999", marginTop: 4 }}>www.ememories.pl</p>
      </div>
    ) : null

  // A real photo forms a left column beside the run of portrait blocks that follow it
  // (sygnet, Ś.P., name, dates, body) — like the QR beside the ceremony run — so those
  // blocks align to each other, not to the full page width. With no photo they stay full-width.
  const groupPhoto = b.photo.enabled !== false && !!data.photo

  const contentRows: { key: string; marginTop: number; marginBottom: number; node: React.ReactNode }[] = []
  for (let i = 0; i < orderedBlocks.length; i++) {
    const item = orderedBlocks[i]
    if (item.id === "photo" && groupPhoto) {
      const run = []
      let j = i + 1
      while (j < orderedBlocks.length && PHOTO_GROUP_IDS.has(orderedBlocks[j].id)) {
        run.push(orderedBlocks[j])
        j++
      }
      contentRows.push({
        key: "photo-group",
        marginTop: b.photo.marginTop,
        marginBottom: run.length ? b[run[run.length - 1].id].marginBottom : b.photo.marginBottom,
        node: (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 24 }}>
            <div style={{ flexShrink: 0 }}>{renderPhoto(data.photo, b.photo.size, data.photoBw)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {run.map((r, idx) => (
                <div
                  key={r.id}
                  style={{
                    marginTop: idx === 0 ? 0 : b[r.id].marginTop,
                    marginBottom: idx === run.length - 1 ? 0 : b[r.id].marginBottom,
                  }}
                >
                  {r.node}
                </div>
              ))}
            </div>
          </div>
        ),
      })
      i = j - 1
      continue
    }
    // When the QR sits in the content column, the whole run of adjacent ceremony blocks
    // (label / date+time / text) becomes one row: QR in one column, the run in the other.
    if (ceremonyQrNode && CEREMONY_GROUP_IDS.has(item.id)) {
      const run = [item]
      let j = i + 1
      while (j < orderedBlocks.length && CEREMONY_GROUP_IDS.has(orderedBlocks[j].id)) {
        run.push(orderedBlocks[j])
        j++
      }
      contentRows.push({
        key: "ceremony-group",
        marginTop: b[run[0].id].marginTop,
        marginBottom: b[run[run.length - 1].id].marginBottom,
        node: (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: b.ceremony.qrGap ?? 16 }}>
            {ceremonyQrNode}
            <div style={{ flex: 1, minWidth: 0 }}>
              {run.map((r, idx) => (
                <div
                  key={r.id}
                  style={{
                    marginTop: idx === 0 ? 0 : b[r.id].marginTop,
                    marginBottom: idx === run.length - 1 ? 0 : b[r.id].marginBottom,
                  }}
                >
                  {r.node}
                </div>
              ))}
            </div>
          </div>
        ),
      })
      i = j - 1
      continue
    }
    const margin = b[item.id]
    contentRows.push({ key: item.id, marginTop: margin.marginTop, marginBottom: margin.marginBottom, node: item.node })
  }

  const graphicNodes: Partial<Record<GraphicItemId, React.ReactNode>> = {
    photo: g.photo.enabled ? renderPhoto(data.photo, g.photo.size, data.photoBw) : null,
    sigil: g.sigil.enabled ? renderSigil(g.sigil.sigilId ?? DEFAULT_SIGIL_ID, g.sigil.size, g.sigil.color ?? DEFAULT_SIGIL_COLOR) : null,
    // The QR no longer renders in the graphic column — it lives inline in the content column.
    qr: null,
  }

  const orderedGraphic = template.graphicOrder.map((id) => ({ id, node: graphicNodes[id] })).filter((item) => item.node !== null)

  const pageContent = (
    <div style={{ width: A4_W, height: A4_H, position: "relative" }}>
      {/* A4 landscape page */}
      <div
        style={{
          width: A4_W,
          height: A4_H,
          boxSizing: "border-box",
          padding: template.pagePadding,
          // CSS `gap` can't go negative; a negative columnGap instead pulls the columns
          // together via a margin on the graphic column, on whichever physical side faces
          // the content column (flipped when the graphic column is on the right).
          gap: Math.max(0, template.columnGap),
          background: "#fff",
          display: "flex",
          flexDirection: template.columnPosition === "right" ? "row-reverse" : "row",
          fontFamily,
          fontWeight: template.fontWeight,
          color: "#111",
          overflow: "hidden",
        }}
      >
        {/* Graphic column: photo, sigil, QR — order, alignment & margins configurable */}
        {template.graphicColumnEnabled && (
          <div
            style={{
              width: 340,
              flexShrink: 0,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: VERTICAL_ALIGN_MAP[template.graphicVerticalAlign],
              padding: "40px 36px",
              overflow: "hidden",
              ...(template.columnGap < 0
                ? { [template.columnPosition === "right" ? "marginLeft" : "marginRight"]: template.columnGap }
                : null),
            }}
          >
            {orderedGraphic.map((item) => {
              const settings = g[item.id]
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: HORIZONTAL_ALIGN_MAP[settings.align],
                    marginTop: settings.marginTop,
                    marginBottom: settings.marginBottom,
                  }}
                >
                  {item.node}
                </div>
              )
            })}
          </div>
        )}

        {/* Content column: photo/sigil, name, dates, headline, body, ceremony — order & spacing configurable */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: VERTICAL_ALIGN_MAP[template.verticalAlign],
            padding: "48px 48px 40px",
            overflow: "hidden",
          }}
        >
          {contentRows.map((row) => (
            <div key={row.key} style={{ marginTop: row.marginTop, marginBottom: row.marginBottom }}>
              {row.node}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{renderFrame(template.frame)}</div>
      {watermarked && renderWatermark(watermarkId)}
    </div>
  )

  if (bare) {
    return <div className={PRINT_FONTS_CLASSNAME}>{pageContent}</div>
  }

  return (
    <div className={PRINT_FONTS_CLASSNAME}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">
        Podgląd A4
      </p>
      <div
        className="group relative cursor-zoom-in"
        style={{ width: cardWidth, border: "1px solid var(--border)", overflow: "hidden" }}
        onClick={() => setZoomOpen(true)}
      >
        <div style={{ height: Math.ceil(A4_H * scale), position: "relative" }}>
          <div
            style={{
              width: A4_W,
              height: A4_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {pageContent}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/10 group-hover:opacity-100">
          <div className="rounded-full bg-black/60 p-3 text-white">
            <ZoomIn className="h-6 w-6" />
          </div>
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className={cn(PRINT_FONTS_CLASSNAME, "max-w-[calc(100%-2rem)] sm:max-w-[min(92vw,1080px)] overflow-auto p-4")}>
          <div style={{ width: Math.ceil(A4_W * zoomScale), height: Math.ceil(A4_H * zoomScale), position: "relative", margin: "0 auto" }}>
            <div
              style={{
                width: A4_W,
                height: A4_H,
                transform: `scale(${zoomScale})`,
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {pageContent}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
