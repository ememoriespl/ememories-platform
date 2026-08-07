"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Signal, Wifi, BatteryFull } from "lucide-react"

// The screen is rendered at a real device resolution and scaled down to fit, so the content
// keeps exactly the proportions it has on a phone (instead of reflowing at a tiny width).
const DEVICE_W = 390
const DEVICE_H = 844

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
          className="absolute left-0 top-0 flex flex-col overflow-hidden rounded-[40px] bg-background shadow-xl ring-1 ring-border"
          style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {/* iOS status bar */}
          <div className="flex shrink-0 items-center justify-between px-9 pt-4 pb-1 text-[15px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <Signal className="h-[18px] w-[18px]" strokeWidth={2.5} />
              <Wifi className="h-[18px] w-[18px]" strokeWidth={2.5} />
              <BatteryFull className="h-6 w-6" strokeWidth={2} />
            </span>
          </div>

          {/* Screen */}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

          {/* Home indicator */}
          <div className="flex shrink-0 justify-center pb-2.5 pt-1">
            <div className="h-[5px] w-36 rounded-full bg-foreground/30" />
          </div>
        </div>
      )}
    </div>
  )
}
