"use client"

import { useLayoutEffect, useRef, useState } from "react"

// Phone mockup from Figma (node 51:10, frame 603×1311). Everything below is that design
// scaled by 390/603 ≈ 0.647 so the screen renders at a real device width and the chrome keeps
// the designed proportions. The screen itself is rendered at DEVICE_W/DEVICE_H and scaled to
// fit its container, so the content lays out exactly as it does on a phone.
const FIGMA_W = 603
const DEVICE_W = 390
const S = DEVICE_W / FIGMA_W

const DEVICE_H = Math.round(1311 * S) // 848
const RADIUS = 48
const BORDER = 6
const STATUS_H = Math.round(64 * S) // 41
/** Safari bottom bar area: the 74px bar plus the 50px gap below it (Figma). */
const BROWSER_BAR_H = 74 * S
const BROWSER_BAR_INSET = 50 * S

/** Cellular / Wifi / Battery, exported from the Figma status bar component. */
function StatusIcons() {
  return (
    <span className="flex items-center" style={{ gap: 6 * S * 1.6 }}>
      <svg width={27.336 * S} height={17.152 * S} viewBox="0 0 27.3359 17.1523" fill="none">
        <path
          d="M3.21582 10.7197C4.10389 10.7197 4.82422 11.4401 4.82422 12.3281V15.5439C4.82422 16.432 4.10389 17.1523 3.21582 17.1523H1.6084C0.720324 17.1523 0 16.432 0 15.5439V12.3281C0 11.4401 0.720324 10.7197 1.6084 10.7197H3.21582ZM10.7197 7.50391C11.6078 7.50391 12.3281 8.22423 12.3281 9.1123V15.5439C12.3281 16.432 11.6078 17.1523 10.7197 17.1523H9.1123C8.22423 17.1523 7.50391 16.432 7.50391 15.5439V9.1123C7.50391 8.22423 8.22423 7.50391 9.1123 7.50391H10.7197ZM18.2236 3.75195C19.1117 3.75195 19.832 4.47228 19.832 5.36035V15.5439C19.832 16.432 19.1117 17.1523 18.2236 17.1523H16.6162C15.7281 17.1523 15.0078 16.432 15.0078 15.5439V5.36035C15.0078 4.47228 15.7281 3.75195 16.6162 3.75195H18.2236ZM25.7275 0C26.6156 0 27.3359 0.720324 27.3359 1.6084V15.5439C27.3359 16.432 26.6156 17.1523 25.7275 17.1523H24.1201C23.232 17.1523 22.5117 16.432 22.5117 15.5439V1.6084C22.5117 0.720324 23.232 0 24.1201 0H25.7275Z"
          fill="black"
        />
      </svg>
      <svg width={24.656 * S} height={17.689 * S} viewBox="0 0 24.6563 17.6887" fill="none">
        <path
          d="M8.76173 13.55C10.8209 11.8102 13.8364 11.8102 15.8955 13.55C15.999 13.6435 16.0595 13.7759 16.0625 13.9153C16.0654 14.0547 16.0107 14.1896 15.9111 14.2873L12.6865 17.5393C12.5921 17.6346 12.4633 17.6886 12.3291 17.6887C12.1947 17.6887 12.0652 17.6347 11.9707 17.5393L8.7461 14.2873C8.64648 14.1895 8.59178 14.0548 8.59474 13.9153C8.59778 13.7758 8.65813 13.6435 8.76173 13.55ZM4.45802 9.21311C8.89475 5.08955 15.7664 5.08955 20.2031 9.21311C20.303 9.30973 20.3599 9.44237 20.3613 9.58128C20.3628 9.72043 20.3081 9.85464 20.21 9.95335L18.3457 11.8352C18.1536 12.0271 17.8435 12.031 17.6465 11.844C16.1897 10.526 14.2944 9.79611 12.3291 9.79612C10.365 9.79694 8.47063 10.5268 7.01466 11.844C6.81769 12.031 6.50756 12.0271 6.31544 11.8352L4.45118 9.95335C4.35285 9.85479 4.2985 9.72044 4.29981 9.58128C4.30121 9.44235 4.35807 9.30971 4.45802 9.21311ZM0.155284 4.88694C6.96019 -1.62898 17.6961 -1.62899 24.501 4.88694C24.5995 4.98375 24.6555 5.11609 24.6563 5.25413C24.6571 5.3921 24.6022 5.52437 24.5049 5.62229L22.6387 7.50511C22.4464 7.69789 22.1346 7.69995 21.9395 7.50999C19.3469 5.04729 15.9063 3.67432 12.3291 3.67405C8.75139 3.67404 5.3098 5.04703 2.71681 7.50999C2.5218 7.70025 2.20976 7.69817 2.01759 7.50511L0.150401 5.62229C0.0533508 5.52434 -0.000858282 5.39197 1.02788e-05 5.25413C0.000919241 5.11608 0.0567098 4.98367 0.155284 4.88694Z"
          fill="black"
        />
      </svg>
      {/* Battery: outline + fill + cap, matching the Figma layer structure */}
      <span className="relative inline-flex items-center" style={{ gap: 1.6 * S }}>
        <span
          className="relative inline-block"
          style={{
            width: 35.376 * S,
            height: 18.224 * S,
            borderRadius: 2.667 * S,
            border: `${1.608 * S}px solid rgba(60,60,67,0.6)`,
            opacity: 0.35,
          }}
        />
        <span
          className="absolute bg-black"
          style={{
            left: 3.216 * S,
            width: 28.944 * S,
            height: 11.792 * S,
            borderRadius: 1.333 * S,
          }}
        />
        <svg width={2.135 * S} height={6.432 * S} viewBox="0 0 2.13549 6.432" fill="none">
          <path
            opacity="0.4"
            d="M0 0V6.432C1.29401 5.88725 2.13549 4.62 2.13549 3.216C2.13549 1.812 1.29401 0.544753 0 0"
            fill="#3C3C43"
            fillOpacity="0.6"
          />
        </svg>
      </span>
    </span>
  )
}

/** Safari bottom bar (Figma "Frame 15", 503×74, #EBEBEB). */
function BrowserBar() {
  return (
    <svg
      width={503 * S}
      height={74 * S}
      viewBox="0 0 503 74"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <circle cx="37" cy="37" r="37" fill="#EBEBEB" />
      <path
        d="M381 0C401.435 0 418 16.5655 418 37C418 57.4345 401.435 74 381 74H122C101.565 74 85 57.4345 85 37C85 16.5655 101.565 0 122 0H381Z"
        fill="#EBEBEB"
      />
      <circle cx="466" cy="37" r="37" fill="#EBEBEB" />
    </svg>
  )
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const h = el.clientHeight
      if (h > 0) setScale(h / DEVICE_H)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative h-full overflow-hidden"
      style={{ width: scale ? DEVICE_W * scale : DEVICE_W }}
    >
      {scale > 0 && (
        <div
          className="absolute left-0 top-0 flex flex-col overflow-hidden bg-background"
          style={{
            width: DEVICE_W,
            height: DEVICE_H,
            borderRadius: RADIUS,
            border: `${BORDER}px solid #000`,
            boxSizing: "border-box",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Status bar */}
          <div
            className="flex shrink-0 items-center justify-between backdrop-blur"
            style={{
              height: STATUS_H,
              paddingLeft: 33.77 * S,
              paddingRight: 37.07 * S,
              background: "rgba(253,253,253,0.92)",
            }}
          >
            <span
              className="font-semibold text-black"
              style={{ fontSize: 22.51 * S, letterSpacing: -0.4502 * S }}
            >
              9:41
            </span>
            <StatusIcons />
          </div>

          {/* Screen */}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

          {/* Safari bottom bar */}
          <div
            className="flex shrink-0 items-start justify-center bg-background"
            style={{ height: BROWSER_BAR_H + BROWSER_BAR_INSET }}
          >
            <BrowserBar />
          </div>
        </div>
      )}
    </div>
  )
}
