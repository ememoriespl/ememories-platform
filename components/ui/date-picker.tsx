"use client"

import { useState, useRef } from "react"
import { format, isValid } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

function parseSegments(value: string) {
  if (!value) return { dd: "", mm: "", yyyy: "" }
  const [y, m, d] = value.split("-")
  return { dd: d ?? "", mm: m ?? "", yyyy: y ?? "" }
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Wybierz datę",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<Date | undefined>()
  const [dd, setDd] = useState("")
  const [mm, setMm] = useState("")
  const [yyyy, setYyyy] = useState("")

  const mmRef = useRef<HTMLInputElement>(null)
  const yyyyRef = useRef<HTMLInputElement>(null)

  const selected = value ? new Date(value + "T12:00:00") : undefined
  const minDate = min ? new Date(min + "T00:00:00") : undefined
  const maxDate = max ? new Date(max + "T23:59:59") : undefined

  function handleOpen(isOpen: boolean) {
    if (disabled) return
    if (isOpen) {
      const segs = parseSegments(value ?? "")
      setDd(segs.dd)
      setMm(segs.mm)
      setYyyy(segs.yyyy)
      setPending(selected)
    }
    setOpen(isOpen)
  }

  function tryUpdatePending(newDd: string, newMm: string, newYyyy: string) {
    if (newDd && newMm && newYyyy.length === 4) {
      const dateStr = `${newYyyy}-${newMm.padStart(2, "0")}-${newDd.padStart(2, "0")}`
      const parsed = new Date(dateStr + "T12:00:00")
      if (isValid(parsed)) setPending(parsed)
    }
  }

  function handleDd(val: string) {
    const n = val.replace(/\D/g, "").slice(0, 2)
    setDd(n)
    if (n.length === 2) mmRef.current?.focus()
    tryUpdatePending(n, mm, yyyy)
  }
  function handleMm(val: string) {
    const n = val.replace(/\D/g, "").slice(0, 2)
    setMm(n)
    if (n.length === 2) yyyyRef.current?.focus()
    tryUpdatePending(dd, n, yyyy)
  }
  function handleYyyy(val: string) {
    const n = val.replace(/\D/g, "").slice(0, 4)
    setYyyy(n)
    tryUpdatePending(dd, mm, n)
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return
    setPending(date)
    setDd(String(date.getDate()).padStart(2, "0"))
    setMm(String(date.getMonth() + 1).padStart(2, "0"))
    setYyyy(String(date.getFullYear()))
  }

  function handleToday() {
    handleCalendarSelect(new Date())
  }

  function handleApply() {
    if (pending) onChange?.(format(pending, "yyyy-MM-dd"))
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
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">
          {selected ? format(selected, "d MMM yyyy", { locale: pl }) : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto min-w-[var(--anchor-width)] p-0 overflow-hidden">
        {/* Segmented DD/MM/RRRR input + Dziś button */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b">
          <div className="flex items-center gap-0.5 flex-1 rounded-md border border-input bg-muted/30 px-2.5 py-1.5 tabular-nums text-sm">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD"
              value={dd}
              onChange={(e) => handleDd(e.target.value)}
              className="w-6 bg-transparent text-center outline-none focus:rounded focus:bg-muted placeholder:text-muted-foreground/50"
            />
            <span className="text-muted-foreground select-none">/</span>
            <input
              ref={mmRef}
              type="text"
              inputMode="numeric"
              placeholder="MM"
              value={mm}
              onChange={(e) => handleMm(e.target.value)}
              className="w-6 bg-transparent text-center outline-none focus:rounded focus:bg-muted placeholder:text-muted-foreground/50"
            />
            <span className="text-muted-foreground select-none">/</span>
            <input
              ref={yyyyRef}
              type="text"
              inputMode="numeric"
              placeholder="RRRR"
              value={yyyy}
              onChange={(e) => handleYyyy(e.target.value)}
              className="w-12 bg-transparent text-center outline-none focus:rounded focus:bg-muted placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            type="button"
            onClick={handleToday}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Dziś
          </button>
        </div>

        {/* Calendar — dropdown caption for easy month/year switching */}
        <Calendar
          mode="single"
          selected={pending}
          onSelect={handleCalendarSelect}
          defaultMonth={pending ?? selected}
          captionLayout="dropdown"
          startMonth={new Date(1920, 0)}
          endMonth={new Date(2100, 11)}
          className="w-full"
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
        />

        {/* Cancel / Apply */}
        <div className="flex items-center gap-2 border-t px-3 py-2.5">
          <Button color="secondary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button size="sm" className="flex-1" onClick={handleApply} disabled={!pending}>
            Zastosuj
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
