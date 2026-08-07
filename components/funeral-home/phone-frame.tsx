import { Signal, Wifi, BatteryFull } from "lucide-react"

/**
 * A phone mockup that keeps a real device aspect ratio (390×844) and fills the available
 * height. Renders an iOS-style status bar and home indicator around scrollable `children`.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex aspect-[390/844] h-full flex-col overflow-hidden rounded-[44px] bg-background shadow-xl ring-1 ring-border">
      {/* iOS status bar */}
      <div className="flex shrink-0 items-center justify-between px-7 pt-3 pb-1 text-[13px] font-semibold text-foreground">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <Signal className="h-4 w-4" strokeWidth={2.5} />
          <Wifi className="h-4 w-4" strokeWidth={2.5} />
          <BatteryFull className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>

      {/* Screen */}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      {/* Home indicator */}
      <div className="flex shrink-0 justify-center py-2">
        <div className="h-1 w-32 rounded-full bg-foreground/40" />
      </div>
    </div>
  )
}
