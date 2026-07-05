"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#000000",
  "#1f2937",
  "#4b5563",
  "#9ca3af",
  "#ffffff",
  "#7f1d1d",
  "#9a3412",
  "#a16207",
  "#166534",
  "#1e3a5f",
]

const HEX_RE = /^#([0-9a-f]{6})$/i

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(value)

  useEffect(() => {
    if (open) setHexInput(value)
  }, [open, value])

  function commitHex(raw: string) {
    const v = raw.trim()
    const normalized = v.startsWith("#") ? v : `#${v}`
    if (HEX_RE.test(normalized)) onChange(normalized)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "h-7 w-7 shrink-0 rounded-md border-2 border-border shadow-xs transition-colors hover:border-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
          className
        )}
        style={{ backgroundColor: value }}
        title={value}
      />
      <PopoverContent align="end" className="w-56 p-3 space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((c) => {
            const active = c.toLowerCase() === value.toLowerCase()
            return (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => onChange(c)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border shadow-xs transition-transform",
                  active ? "ring-2 ring-primary ring-offset-2" : "border-border hover:scale-110"
                )}
                style={{ backgroundColor: c }}
              >
                {active && (
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: isLight(c) ? "#000" : "#fff" }}
                    strokeWidth={3}
                  />
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 border-t pt-3">
          <label
            className="h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={HEX_RE.test(value) ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-10 -translate-x-1 -translate-y-1 cursor-pointer opacity-0"
            />
          </label>
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={() => commitHex(hexInput)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitHex(hexInput)
            }}
            placeholder="#555555"
            className="h-8 flex-1 px-2 text-xs font-mono"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
