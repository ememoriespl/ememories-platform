"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

export function TimePicker({ value, onChange, className, disabled }: TimePickerProps) {
  return (
    <div className="relative">
      <input
        type="time"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm shadow-xs",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
      />
      <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
