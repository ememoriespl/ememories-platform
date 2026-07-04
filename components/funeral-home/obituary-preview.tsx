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

export interface PrintTemplateSettings {
  fontId: string
  fontWeight: 400 | 700
  align: "left" | "center" | "right"
  sigilId: string
  sigilSize: number
  sizes: {
    name: number
    dates: number
    headline: number
    body: number
    ceremonyLabel: number
    ceremonyInfo: number
  }
}

export const DEFAULT_PRINT_TEMPLATE: PrintTemplateSettings = {
  fontId: DEFAULT_PRINT_FONT_ID,
  fontWeight: 400,
  align: "center",
  sigilId: DEFAULT_SIGIL_ID,
  sigilSize: 32,
  sizes: {
    name: 22,
    dates: 12,
    headline: 13,
    body: 12,
    ceremonyLabel: 9,
    ceremonyInfo: 11,
  },
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

  const cardWidth = availableWidth ?? Math.round(A4_W * scale)
  const fontFamily = getPrintFontFamily(template.fontId)
  const align = template.align
  const qrImageUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(publicUrl)}`
    : null

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
                flexDirection: "row",
                fontFamily,
                fontWeight: template.fontWeight,
                color: "#111",
                overflow: "hidden",
              }}
            >
              {/* Left column: sigil, photo, name, dates */}
              <div
                style={{
                  width: 340,
                  flexShrink: 0,
                  background: "#fff",
                  borderRight: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 36px",
                  gap: 0,
                }}
              >
                <div style={{ fontSize: template.sigilSize, marginBottom: 20, color: "#555" }}>
                  {getSigilChar(template.sigilId)}
                </div>

                {data.photo && (
                  <div style={{ marginBottom: 20 }}>
                    <img
                      src={data.photo}
                      alt=""
                      style={{
                        width: 130,
                        height: 130,
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: "block",
                        filter: data.photoBw ? "grayscale(100%)" : "none",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                      }}
                    />
                  </div>
                )}

                <h1
                  style={{
                    fontSize: template.sizes.name,
                    fontWeight: "bold",
                    textAlign: align,
                    lineHeight: 1.3,
                    marginBottom: 10,
                    opacity: hasName ? 1 : 0.25,
                  }}
                >
                  {name}
                </h1>

                <p
                  style={{
                    fontSize: template.sizes.dates,
                    textAlign: align,
                    color: "#666",
                    lineHeight: 1.6,
                  }}
                >
                  {birthFmt ? `ur. ${birthFmt}` : "—"}
                  <br />
                  {deathFmt ? `zm. ${deathFmt}` : "—"}
                </p>
              </div>

              {/* Right column: headline, body, ceremony */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "48px 48px 40px",
                  overflow: "hidden",
                }}
              >
                {/* Headline */}
                {data.obituaryHeadline ? (
                  <p
                    style={{
                      fontSize: template.sizes.headline,
                      fontStyle: "italic",
                      textAlign: align,
                      lineHeight: 1.75,
                      marginBottom: 20,
                      color: "#333",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: 16,
                    }}
                  >
                    {data.obituaryHeadline}
                  </p>
                ) : (
                  <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 20, paddingBottom: 16 }} />
                )}

                {/* Body */}
                <p
                  style={{
                    fontSize: template.sizes.body,
                    textAlign: align,
                    lineHeight: 1.85,
                    color: "#222",
                    whiteSpace: "pre-wrap",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data.obituaryText || ""}
                </p>

                {/* Ceremony + QR */}
                {(ceremonyDateFmt || data.ceremonyInfo || qrImageUrl) && (
                  <div
                    style={{
                      marginTop: 20,
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 16,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 20,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: template.sizes.ceremonyLabel,
                          textAlign: align,
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
                        <p style={{ fontSize: template.sizes.ceremonyInfo + 1, textAlign: align, marginBottom: 4, color: "#222" }}>
                          {ceremonyDateFmt}
                          {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
                        </p>
                      )}
                      {data.ceremonyInfo && (
                        <p style={{ fontSize: template.sizes.ceremonyInfo, textAlign: align, fontStyle: "italic", lineHeight: 1.6, color: "#555" }}>
                          {data.ceremonyInfo}
                        </p>
                      )}
                    </div>
                    {qrImageUrl && (
                      <div style={{ flexShrink: 0, textAlign: "center" }}>
                        <img src={qrImageUrl} alt="Kod QR do eNekrologu" width={72} height={72} />
                        <p style={{ fontSize: 7, color: "#999", marginTop: 4 }}>eNekrolog</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
