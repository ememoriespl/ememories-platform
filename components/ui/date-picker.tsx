"use client"

import { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

  const selected = value ? new Date(value + "T12:00:00") : undefined
  const minDate = min ? new Date(min + "T00:00:00") : undefined
  const maxDate = max ? new Date(max + "T23:59:59") : undefined

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors",
          "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span>
          {selected ? format(selected, "d MMM yyyy", { locale: pl }) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange?.(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          defaultMonth={selected}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
