"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function Checkbox({ checked, onCheckedChange, className, disabled }: CheckboxProps) {
  const isIndeterminate = checked === "indeterminate"

  return (
    <CheckboxPrimitive.Root
      checked={isIndeterminate ? false : checked}
      indeterminate={isIndeterminate}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors outline-none",
        "data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        "data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "cursor-pointer",
        className
      )}
    >
      <CheckboxPrimitive.Indicator>
        {isIndeterminate ? (
          <Minus className="h-3 w-3" strokeWidth={3} />
        ) : (
          <Check className="h-3 w-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
