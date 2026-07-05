"use client"

import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"
import { PRINT_FONTS_CLASSNAME, getPrintFontFamily, DEFAULT_PRINT_FONT_ID } from "@/lib/print-fonts"
import { getSigilOption, DEFAULT_SIGIL_ID, DEFAULT_SIGIL_COLOR } from "@/lib/print-sigils"

export interface PreviewData {
  firstName: string
  lastName: string
  birthDate: string
  deathDate: string
  obituaryHeadline: string
  obituaryText: string
  ceremonyInfo: string
  ceremonyDate: string
  ceremonyTime: string
  photo: string | null
  photoBw: boolean
}

export type ContentBlockId = "photo" | "sigil" | "sp" | "name" | "dates" | "headline" | "body" | "ceremonyLabel" | "ceremony"
export type GraphicItemId = "photo" | "sigil" | "qr"

export type BlockAlign = "left" | "center" | "right"
export type VerticalAlign = "top" | "center" | "bottom"

export interface BlockSettings {
  size: number
  align: BlockAlign
  marginTop: number
  marginBottom: number
  fontId?: string
  fontWeight?: number
  enabled?: boolean
  text?: string
  sigilId?: string
  color?: string
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

export type FrameStyle = "none" | "simple" | "double" | "dashed" | "classic-thick" | "ornamental-corners"

export interface FrameSettings {
  style: FrameStyle
  color: string
}

export const FRAME_STYLE_OPTIONS: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "Brak" },
  { id: "simple", label: "Cienka linia" },
  { id: "double", label: "Podwójna linia" },
  { id: "dashed", label: "Przerywana" },
  { id: "classic-thick", label: "Gruba klasyczna" },
  { id: "ornamental-corners", label: "Rogi ozdobne" },
]

export const DEFAULT_FRAME_COLOR = "#333333"

export interface PrintTemplateSettings {
  fontId: string
  fontWeight: number
  columnPosition: "left" | "right"
  verticalAlign: VerticalAlign
  blockOrder: ContentBlockId[]
  blocks: Record<ContentBlockId, BlockSettings>
  graphicOrder: GraphicItemId[]
  graphicItems: Record<GraphicItemId, GraphicItemSettings>
  frame: FrameSettings
}

export const DEFAULT_BLOCK_ORDER: ContentBlockId[] = ["photo", "sigil", "sp", "name", "dates", "headline", "body", "ceremonyLabel", "ceremony"]
export const DEFAULT_GRAPHIC_ORDER: GraphicItemId[] = ["photo", "sigil", "qr"]

export const DEFAULT_PRINT_TEMPLATE: PrintTemplateSettings = {
  fontId: DEFAULT_PRINT_FONT_ID,
  fontWeight: 400,
  columnPosition: "left",
  verticalAlign: "center",
  blockOrder: DEFAULT_BLOCK_ORDER,
  blocks: {
    photo: { size: 130, align: "center", marginTop: 0, marginBottom: 20, enabled: true },
    sigil: { size: 64, align: "center", marginTop: 0, marginBottom: 20, enabled: false, sigilId: DEFAULT_SIGIL_ID, color: DEFAULT_SIGIL_COLOR },
    sp: { size: 14, align: "center", marginTop: 0, marginBottom: 8, enabled: true, text: "Ś.P." },
    name: { size: 22, align: "center", marginTop: 0, marginBottom: 8, fontWeight: 700 },
    dates: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    headline: { size: 13, align: "center", marginTop: 0, marginBottom: 24 },
    body: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    ceremonyLabel: { size: 9, align: "center", marginTop: 0, marginBottom: 6, fontWeight: 600 },
    ceremony: { size: 11, align: "center", marginTop: 0, marginBottom: 0 },
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
}

const HORIZONTAL_ALIGN_MAP: Record<BlockAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
}

// A4 landscape: 297mm × 210mm at 96dpi ≈ 1123 × 794
const A4_W = 1123
const A4_H = 794

// A quarter-wreath spray for the "ornamental-corners" frame style, drawn for the
// top-left corner; the other three corners reuse it via CSS mirroring.
export function CornerOrnament({ color, size }: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 90 90" width={size} height={size} fill={color}>
      <path d="M 0 -7.8 C 4.2 -3.51 4.2 3.51 0 7.8 C -4.2 3.51 -4.2 -3.51 0 -7.8 Z" transform="translate(0.05 84.86) rotate(240.00) translate(0 -4.68)" />
      <path d="M 0 -10.4 C 5.6 -4.68 5.6 4.68 0 10.4 C -5.6 4.68 -5.6 -4.68 0 -10.4 Z" transform="translate(2.32 62.63) rotate(255.67) translate(0 -6.24)" />
      <path d="M 0 -12.3 C 6.62 -5.54 6.62 5.54 0 12.3 C -6.62 5.54 -6.62 -5.54 0 -12.3 Z" transform="translate(10.51 41.83) rotate(271.33) translate(0 -7.38)" />
      <path d="M 0 -13 C 7 -5.85 7 5.85 0 13 C -7 5.85 -7 -5.85 0 -13 Z" transform="translate(24.02 24.02) rotate(287.00) translate(0 -7.80)" />
      <path d="M 0 -12.3 C 6.62 -5.54 6.62 5.54 0 12.3 C -6.62 5.54 -6.62 -5.54 0 -12.3 Z" transform="translate(41.83 10.51) rotate(302.67) translate(0 -7.38)" />
      <path d="M 0 -10.4 C 5.6 -4.68 5.6 4.68 0 10.4 C -5.6 4.68 -5.6 -4.68 0 -10.4 Z" transform="translate(62.63 2.32) rotate(318.33) translate(0 -6.24)" />
      <path d="M 0 -7.8 C 4.2 -3.51 4.2 3.51 0 7.8 C -4.2 3.51 -4.2 -3.51 0 -7.8 Z" transform="translate(84.86 0.05) rotate(334.00) translate(0 -4.68)" />
    </svg>
  )
}

export function renderFrame(frame: FrameSettings, opts?: { margin?: number; cornerSize?: number }): React.ReactNode {
  const { color, style } = frame
  const margin = opts?.margin ?? 16
  if (style === "none") return null
  if (style === "simple") {
    return <div style={{ position: "absolute", inset: margin, border: `1.5px solid ${color}` }} />
  }
  if (style === "dashed") {
    return <div style={{ position: "absolute", inset: margin, border: `1.5px dashed ${color}` }} />
  }
  if (style === "double") {
    return (
      <>
        <div style={{ position: "absolute", inset: margin, border: `1px solid ${color}` }} />
        <div style={{ position: "absolute", inset: margin + 6, border: `1px solid ${color}` }} />
      </>
    )
  }
  if (style === "classic-thick") {
    return (
      <>
        <div style={{ position: "absolute", inset: margin, border: `3px solid ${color}` }} />
        <div style={{ position: "absolute", inset: margin + 8, border: `1px solid ${color}` }} />
      </>
    )
  }
  // ornamental-corners
  const cornerSize = opts?.cornerSize ?? 90
  const cornerOffset = margin - cornerSize * 0.07
  return (
    <>
      <div style={{ position: "absolute", inset: margin, border: `1px solid ${color}` }} />
      <div style={{ position: "absolute", top: cornerOffset, left: cornerOffset }}>
        <CornerOrnament color={color} size={cornerSize} />
      </div>
      <div style={{ position: "absolute", top: cornerOffset, right: cornerOffset, transform: "scaleX(-1)" }}>
        <CornerOrnament color={color} size={cornerSize} />
      </div>
      <div style={{ position: "absolute", bottom: cornerOffset, left: cornerOffset, transform: "scaleY(-1)" }}>
        <CornerOrnament color={color} size={cornerSize} />
      </div>
      <div style={{ position: "absolute", bottom: cornerOffset, right: cornerOffset, transform: "scaleX(-1) scaleY(-1)" }}>
        <CornerOrnament color={color} size={cornerSize} />
      </div>
    </>
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
  return style
}

function renderSigil(sigilId: string, size: number, color: string): React.ReactNode {
  const option = getSigilOption(sigilId)
  if (option.kind === "text") {
    return <div style={{ fontSize: size, color, lineHeight: 1 }}>{option.char}</div>
  }
  const width = size * (option.aspect ?? 1)
  return (
    <div
      style={{
        width,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${option.src})`,
        maskImage: `url(${option.src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  )
}

export function ObituaryPreview({
  data,
  availableWidth,
  template = DEFAULT_PRINT_TEMPLATE,
  publicUrl,
  bare = false,
}: {
  data: PreviewData
  availableWidth?: number
  template?: PrintTemplateSettings
  publicUrl?: string
  /** Renders just the A4 page at natural size with no preview chrome (label, border, scaling) — used for printing. */
  bare?: boolean
}) {
  const scale = availableWidth && availableWidth > 0 ? availableWidth / A4_W : 0.5

  const hasName = data.firstName || data.lastName
  const name = hasName ? `${data.firstName} ${data.lastName}`.trim() : "Imię Nazwisko"
  const birthFmt = data.birthDate ? safeFormat(data.birthDate, "d MMMM yyyy") : null
  const deathFmt = data.deathDate ? safeFormat(data.deathDate, "d MMMM yyyy") : null
  const ceremonyDateFmt = data.ceremonyDate ? safeFormat(data.ceremonyDate, "d MMMM yyyy") : null
  const dateLine = birthFmt && deathFmt ? `${birthFmt} — ${deathFmt}` : birthFmt ? `ur. ${birthFmt}` : deathFmt ? `zm. ${deathFmt}` : "—"

  const cardWidth = availableWidth ?? Math.round(A4_W * scale)
  const fontFamily = getPrintFontFamily(template.fontId)
  const g = template.graphicItems
  const qrImageUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${g.qr.size * 2}x${g.qr.size * 2}&margin=8&data=${encodeURIComponent(publicUrl)}`
    : null

  const b = template.blocks
  const showCeremony = !!(ceremonyDateFmt || data.ceremonyInfo)

  const blocks: Partial<Record<ContentBlockId, React.ReactNode>> = {
    photo:
      b.photo.enabled !== false && data.photo ? (
        <div style={{ display: "flex", justifyContent: HORIZONTAL_ALIGN_MAP[b.photo.align] }}>
          <img
            src={data.photo}
            alt=""
            style={{
              width: b.photo.size,
              height: b.photo.size,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              filter: data.photoBw ? "grayscale(100%)" : "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          />
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
          lineHeight: 1.3,
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
          fontStyle: "italic",
          textAlign: b.headline.align,
          lineHeight: 1.75,
          color: "#333",
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
    ceremony: showCeremony ? (
      <div>
        {ceremonyDateFmt && (
          <p style={{ fontSize: b.ceremony.size + 1, textAlign: b.ceremony.align, marginBottom: 4, color: "#222", ...fontStyleFor(b.ceremony) }}>
            {ceremonyDateFmt}
            {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
          </p>
        )}
        {data.ceremonyInfo && (
          <p
            style={{
              fontSize: b.ceremony.size,
              textAlign: b.ceremony.align,
              fontStyle: "italic",
              lineHeight: 1.6,
              color: "#555",
              ...fontStyleFor(b.ceremony),
            }}
          >
            {data.ceremonyInfo}
          </p>
        )}
      </div>
    ) : null,
  }

  const orderedBlocks = template.blockOrder.map((id) => ({ id, node: blocks[id] })).filter((item) => item.node !== null)

  const graphicNodes: Partial<Record<GraphicItemId, React.ReactNode>> = {
    photo:
      g.photo.enabled && data.photo ? (
        <img
          src={data.photo}
          alt=""
          style={{
            width: g.photo.size,
            height: g.photo.size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            filter: data.photoBw ? "grayscale(100%)" : "none",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
        />
      ) : null,
    sigil: g.sigil.enabled ? renderSigil(g.sigil.sigilId ?? DEFAULT_SIGIL_ID, g.sigil.size, g.sigil.color ?? DEFAULT_SIGIL_COLOR) : null,
    qr:
      g.qr.enabled && qrImageUrl ? (
        <div style={{ textAlign: "center" }}>
          <img src={qrImageUrl} alt="Kod QR do eNekrologu" width={g.qr.size} height={g.qr.size} />
          <p style={{ fontSize: 7, color: "#999", marginTop: 4 }}>eNekrolog</p>
        </div>
      ) : null,
  }

  const orderedGraphic = template.graphicOrder.map((id) => ({ id, node: graphicNodes[id] })).filter((item) => item.node !== null)

  const pageContent = (
    <div style={{ width: A4_W, height: A4_H, position: "relative" }}>
      {/* A4 landscape page */}
      <div
        style={{
          width: A4_W,
          height: A4_H,
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
        <div
          style={{
            width: 340,
            flexShrink: 0,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "40px 36px",
            overflow: "hidden",
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
          {orderedBlocks.map((item) => {
            const margin = b[item.id]
            return (
              <div key={item.id} style={{ marginTop: margin.marginTop, marginBottom: margin.marginBottom }}>
                {item.node}
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{renderFrame(template.frame)}</div>
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
      <div style={{ width: cardWidth, border: "1px solid var(--border)", overflow: "hidden" }}>
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
      </div>
    </div>
  )
}
