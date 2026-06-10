"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ── UUI colours ────────────────────────────────────────────
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/25",
        secondary:
          "border-border bg-background text-foreground shadow-xs hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20",
        tertiary:
          "text-foreground hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20",
        error:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-4 focus-visible:ring-destructive/25",
        "error-secondary":
          "border-destructive/40 bg-background text-destructive shadow-xs hover:bg-destructive/5 focus-visible:ring-4 focus-visible:ring-destructive/20",
        "error-tertiary":
          "text-destructive hover:bg-destructive/5 focus-visible:ring-4 focus-visible:ring-destructive/20",
        // ── backward-compat aliases ────────────────────────────────
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/25",
        outline:
          "border-border bg-background text-foreground shadow-xs hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20",
        ghost:
          "text-foreground hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-4 focus-visible:ring-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // ── UUI sizes ──────────────────────────────────────────────
        xs: "h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-3.5 text-sm",
        md: "h-10 gap-2 px-4 text-sm",
        lg: "h-11 gap-2 px-[18px] text-base",
        xl: "h-12 gap-2.5 px-5 text-base",
        // ── backward-compat ────────────────────────────────────────
        default: "h-10 gap-2 px-4 text-sm",
        icon: "size-9",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type UUIColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "error-secondary"
  | "error-tertiary"

function Button({
  className,
  color,
  variant,
  size = "md",
  ...props
}: Omit<ButtonPrimitive.Props, "color"> &
  VariantProps<typeof buttonVariants> & { color?: UUIColor }) {
  const resolvedVariant = (color ??
    variant ??
    "primary") as VariantProps<typeof buttonVariants>["variant"]

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant: resolvedVariant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
