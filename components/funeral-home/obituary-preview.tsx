"use client"

import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"
import { PRINT_FONTS_CLASSNAME, getPrintFontFamily, DEFAULT_PRINT_FONT_ID } from "@/lib/print-fonts"
import { getSigilChar, DEFAULT_SIGIL_ID } from "@/lib/print-sigils"

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

export type ContentBlockId = "photo" | "name" | "dates" | "headline" | "body" | "ceremony"

export type BlockAlign = "left" | "center" | "right"

export interface BlockSettings {
  size: number
  labelSize?: number
  align: BlockAlign
  marginTop: number
  marginBottom: number
}

export interface PrintTemplateSettings {
  fontId: string
  fontWeight: number
  sigilId: string
  sigilSize: number
  showPhoto: boolean
  qrSize: number
  columnPosition: "left" | "right"
  verticalAlign: "top" | "center" | "bottom"
  blockOrder: ContentBlockId[]
  blocks: Record<ContentBlockId, BlockSettings>
}

export const DEFAULT_BLOCK_ORDER: ContentBlockId[] = ["photo", "name", "dates", "headline", "body", "ceremony"]

export const DEFAULT_PRINT_TEMPLATE: PrintTemplateSettings = {
  fontId: DEFAULT_PRINT_FONT_ID,
  fontWeight: 400,
  sigilId: DEFAULT_SIGIL_ID,
  sigilSize: 32,
  showPhoto: true,
  qrSize: 72,
  columnPosition: "left",
  verticalAlign: "center",
  blockOrder: DEFAULT_BLOCK_ORDER,
  blocks: {
    photo: { size: 130, align: "center", marginTop: 0, marginBottom: 20 },
    name: { size: 22, align: "center", marginTop: 0, marginBottom: 8 },
    dates: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    headline: { size: 13, align: "center", marginTop: 0, marginBottom: 24 },
    body: { size: 12, align: "center", marginTop: 0, marginBottom: 24 },
    ceremony: { size: 11, labelSize: 9, align: "center", marginTop: 0, marginBottom: 0 },
  },
}

const VERTICAL_ALIGN_MAP: Record<PrintTemplateSettings["verticalAlign"], string> = {
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

function safeFormat(dateStr: string, fmt: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00")
    if (!isValid(d)) return "—"
    return format(d, fmt, { locale: pl })
  } catch {
    return "—"
  }
}

export function ObituaryPreview({
  data,
  availableWidth,
  template = DEFAULT_PRINT_TEMPLATE,
  publicUrl,
}: {
  data: PreviewData
  availableWidth?: number
  template?: PrintTemplateSettings
  publicUrl?: string
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
  const qrImageUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${template.qrSize * 2}x${template.qrSize * 2}&margin=8&data=${encodeURIComponent(publicUrl)}`
    : null

  const b = template.blocks

  const blocks: Partial<Record<ContentBlockId, React.ReactNode>> = {
    photo:
      template.showPhoto && data.photo ? (
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
    name: (
      <h1
        style={{
          fontSize: b.name.size,
          fontWeight: "bold",
          textAlign: b.name.align,
          lineHeight: 1.3,
          opacity: hasName ? 1 : 0.25,
        }}
      >
        {name}
      </h1>
    ),
    dates: (
      <p style={{ fontSize: b.dates.size, textAlign: b.dates.align, color: "#666", lineHeight: 1.6 }}>{dateLine}</p>
    ),
    headline: data.obituaryHeadline ? (
      <p
        style={{
          fontSize: b.headline.size,
          fontStyle: "italic",
          textAlign: b.headline.align,
          lineHeight: 1.75,
          color: "#333",
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
        }}
      >
        {data.obituaryText || ""}
      </p>
    ),
    ceremony:
      ceremonyDateFmt || data.ceremonyInfo ? (
        <div>
          <p
            style={{
              fontSize: b.ceremony.labelSize,
              textAlign: b.ceremony.align,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
              marginBottom: 6,
              color: "#888",
            }}
          >
            Ceremonia pogrzebowa
          </p>
          {ceremonyDateFmt && (
            <p style={{ fontSize: b.ceremony.size + 1, textAlign: b.ceremony.align, marginBottom: 4, color: "#222" }}>
              {ceremonyDateFmt}
              {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
            </p>
          )}
          {data.ceremonyInfo && (
            <p style={{ fontSize: b.ceremony.size, textAlign: b.ceremony.align, fontStyle: "italic", lineHeight: 1.6, color: "#555" }}>
              {data.ceremonyInfo}
            </p>
          )}
        </div>
      ) : null,
  }

  const orderedBlocks = template.blockOrder
    .map((id) => ({ id, node: blocks[id] }))
    .filter((item) => item.node !== null)

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
              {/* Graphic column: sigil, QR */}
              <div
                style={{
                  width: 340,
                  flexShrink: 0,
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 36px",
                  gap: 24,
                }}
              >
                <div style={{ fontSize: template.sigilSize, color: "#555" }}>{getSigilChar(template.sigilId)}</div>

                {qrImageUrl && (
                  <div style={{ textAlign: "center" }}>
                    <img src={qrImageUrl} alt="Kod QR do eNekrologu" width={template.qrSize} height={template.qrSize} />
                    <p style={{ fontSize: 7, color: "#999", marginTop: 4 }}>eNekrolog</p>
                  </div>
                )}
              </div>

              {/* Content column: photo, name, dates, headline, body, ceremony — order & spacing configurable */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
