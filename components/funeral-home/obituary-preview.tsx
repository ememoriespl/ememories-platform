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

const A4_WIDTH = 794

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
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / A4_WIDTH)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const hasName = data.firstName || data.lastName
  const name = hasName ? `${data.firstName} ${data.lastName}`.trim() : "Imię Nazwisko"
  const birthFmt = data.birthDate ? safeFormat(data.birthDate, "d MMMM yyyy") : null
  const deathFmt = data.deathDate ? safeFormat(data.deathDate, "d MMMM yyyy") : null
  const ceremonyDateFmt = data.ceremonyDate ? safeFormat(data.ceremonyDate, "d MMMM yyyy") : null
  const a4Height = Math.ceil(1123 * scale)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">
        Podgląd A4
      </p>
      <div ref={containerRef} className="w-full">
        <div style={{ height: a4Height, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              width: A4_WIDTH,
              minHeight: 1123,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <div
              style={{
                width: A4_WIDTH,
                minHeight: 1123,
                padding: "64px 72px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#111",
              }}
            >
              {/* Cross */}
              <div style={{ fontSize: 36, marginBottom: 24 }}>✝</div>

              {/* Photo */}
              {data.photo && (
                <div style={{ marginBottom: 24 }}>
                  <img
                    src={data.photo}
                    alt=""
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                      filter: data.photoBw ? "grayscale(100%)" : "none",
                    }}
                  />
                </div>
              )}

              {/* Name */}
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 8,
                  lineHeight: 1.3,
                  opacity: hasName ? 1 : 0.25,
                }}
              >
                {name}
              </h1>

              {/* Dates */}
              <p
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  marginBottom: 32,
                  color: "#666",
                  letterSpacing: "0.03em",
                }}
              >
                {birthFmt ?? "—"}&ensp;–&ensp;{deathFmt ?? "—"}
              </p>

              {/* Divider */}
              <div
                style={{
                  width: 64,
                  borderTop: "1px solid #bbb",
                  marginBottom: 28,
                }}
              />

              {/* Headline */}
              {data.obituaryHeadline && (
                <p
                  style={{
                    fontSize: 13,
                    fontStyle: "italic",
                    textAlign: "center",
                    maxWidth: 560,
                    lineHeight: 1.75,
                    marginBottom: 24,
                    color: "#333",
                  }}
                >
                  {data.obituaryHeadline}
                </p>
              )}

              {/* Body */}
              {data.obituaryText && (
                <p
                  style={{
                    fontSize: 12,
                    textAlign: "justify",
                    maxWidth: 560,
                    lineHeight: 1.85,
                    marginBottom: 32,
                    color: "#222",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {data.obituaryText}
                </p>
              )}

              {/* Ceremony */}
              {(ceremonyDateFmt || data.ceremonyInfo) && (
                <>
                  <div
                    style={{
                      width: 64,
                      borderTop: "1px solid #bbb",
                      marginBottom: 24,
                    }}
                  />
                  <div style={{ textAlign: "center", maxWidth: 560 }}>
                    <p
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 600,
                        marginBottom: 10,
                        color: "#666",
                      }}
                    >
                      Ceremonia pogrzebowa
                    </p>
                    {ceremonyDateFmt && (
                      <p style={{ fontSize: 13, marginBottom: 8 }}>
                        {ceremonyDateFmt}
                        {data.ceremonyTime && `, godz. ${data.ceremonyTime}`}
                      </p>
                    )}
                    {data.ceremonyInfo && (
                      <p
                        style={{
                          fontSize: 12,
                          fontStyle: "italic",
                          lineHeight: 1.7,
                          color: "#444",
                        }}
                      >
                        {data.ceremonyInfo}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
