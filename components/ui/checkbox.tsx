"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
  size?: "sm" | "md"
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  disabled,
  size = "md",
}: CheckboxProps) {
  const isIndeterminate = checked === "indeterminate"

  return (
    <CheckboxPrimitive.Root
      checked={isIndeterminate ? false : checked}
      indeterminate={isIndeterminate}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "flex shrink-0 items-center justify-center rounded border border-input bg-background shadow-xs transition-colors outline-none",
        "data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        "data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "cursor-pointer",
        size === "sm" ? "h-4 w-4 rounded-[4px]" : "h-5 w-5 rounded-[6px]",
        className
      )}
    >
      <CheckboxPrimitive.Indicator>
        {isIndeterminate ? (
          <Minus className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={3} />
        ) : (
          <Check className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

interface CheckboxFieldProps extends CheckboxProps {
  label: React.ReactNode
  hint?: React.ReactNode
}

export function CheckboxField({ label, hint, ...checkboxProps }: CheckboxFieldProps) {
  return (
    <div className="flex gap-2.5">
      <Checkbox {...checkboxProps} className={cn("mt-0.5 shrink-0", checkboxProps.className)} />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-snug text-foreground select-none cursor-pointer">
          {label}
        </span>
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
    </div>
  )
}
