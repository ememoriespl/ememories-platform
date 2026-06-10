"use client"

import { useState, useRef, useEffect } from "react"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function parseTime(value: string) {
  const [h, m] = (value ?? "").split(":").map(Number)
  return {
    hours: isNaN(h) ? 0 : Math.min(23, Math.max(0, h)),
    minutes: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
  }
}

function SpinInput({
  value,
  onUp,
  onDown,
  onCommit,
  max,
}: {
  value: number
  onUp: () => void
  onDown: () => void
  onCommit: (val: number) => void
  max: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const focused = useRef(false)

  useEffect(() => {
    const el = inputRef.current
    if (el && !focused.current) {
      el.value = pad(value)
    }
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    e.target.value = raw
    const n = parseInt(raw, 10)
    if (!isNaN(n)) onCommit(Math.min(max, Math.max(0, n)))
  }

  function handleBlur() {
    focused.current = false
    const el = inputRef.current
    if (!el) return
    const n = parseInt(el.value, 10)
    const clamped = isNaN(n) ? value : Math.min(max, Math.max(0, n))
    el.value = pad(clamped)
    onCommit(clamped)
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    focused.current = true
    e.target.select()
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onUp}
        className="flex h-7 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        defaultValue={pad(value)}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="h-11 w-14 rounded-md border border-input bg-background text-center tabular-nums text-xl font-semibold outline-none focus:ring-2 focus:ring-ring/50"
      />
      <button
        type="button"
        onClick={onDown}
        className="flex h-7 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}

export function TimePicker({ value, onChange, className, disabled }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [h, setH] = useState(0)
  const [m, setM] = useState(0)

  function handleOpen(isOpen: boolean) {
    if (disabled) return
    if (isOpen) {
      const parsed = parseTime(value ?? "")
      setH(parsed.hours)
      setM(parsed.minutes)
    }
    setOpen(isOpen)
  }

  function handleApply() {
    onChange?.(`${pad(h)}:${pad(m)}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors text-left",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 tabular-nums">
          {value ?? "Wybierz godzinę"}
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto min-w-[var(--anchor-width)] p-0 overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-4 py-4">
          <SpinInput
            value={h}
            onUp={() => setH((prev) => (prev + 1) % 24)}
            onDown={() => setH((prev) => (prev - 1 + 24) % 24)}
            onCommit={setH}
            max={23}
          />
          <span className="text-2xl font-bold text-muted-foreground pb-0.5 select-none">:</span>
          <SpinInput
            value={m}
            onUp={() => setM((prev) => (prev + 1) % 60)}
            onDown={() => setM((prev) => (prev - 1 + 60) % 60)}
            onCommit={setM}
            max={59}
          />
        </div>

        <div className="flex items-center gap-2 border-t px-3 py-2.5">
          <Button color="secondary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button size="sm" className="flex-1" onClick={handleApply}>
            Zastosuj
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
