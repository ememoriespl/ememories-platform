"use client"

import { useRef, useState, useEffect } from "react"
import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"

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

export function ObituaryPreview({ data }: { data: PreviewData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.38)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / A4_W)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const hasName = data.firstName || data.lastName
  const name = hasName ? `${data.firstName} ${data.lastName}`.trim() : "Imię Nazwisko"
  const birthFmt = data.birthDate ? safeFormat(data.birthDate, "d MMMM yyyy") : null
  const deathFmt = data.deathDate ? safeFormat(data.deathDate, "d MMMM yyyy") : null
  const ceremonyDateFmt = data.ceremonyDate ? safeFormat(data.ceremonyDate, "d MMMM yyyy") : null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">
        Podgląd A4
      </p>
      <div ref={containerRef} className="w-full">
        <div style={{ height: Math.ceil(A4_H * scale), position: "relative", overflow: "hidden" }}>
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
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                display: "flex",
                flexDirection: "row",
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#111",
                overflow: "hidden",
              }}
            >
              {/* Left column: cross, photo, name, dates */}
              <div
                style={{
                  width: 340,
                  flexShrink: 0,
                  background: "#f9f9f9",
                  borderRight: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 36px",
                  gap: 0,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 20, color: "#555" }}>✝</div>

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
                    fontSize: 22,
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: 1.3,
                    marginBottom: 10,
                    opacity: hasName ? 1 : 0.25,
                  }}
                >
                  {name}
                </h1>

                <p
                  style={{
                    fontSize: 12,
                    textAlign: "center",
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
                      fontSize: 13,
                      fontStyle: "italic",
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
                    fontSize: 12,
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

                {/* Ceremony */}
                {(ceremonyDateFmt || data.ceremonyInfo) && (
                  <div
                    style={{
                      marginTop: 20,
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
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
                      <p style={{ fontSize: 12, marginBottom: 4, color: "#222" }}>
                        {ceremonyDateFmt}
                        {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
                      </p>
                    )}
                    {data.ceremonyInfo && (
                      <p style={{ fontSize: 11, fontStyle: "italic", lineHeight: 1.6, color: "#555" }}>
                        {data.ceremonyInfo}
                      </p>
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
