"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TopbarProps {
  title: string
  subtitle?: string
  /** Optional status chip rendered to the right of the subtitle (e.g. obituary status). */
  badge?: React.ReactNode
}

interface MeData {
  email: string
  role: "admin" | "funeral-home"
  funeralHome: { name: string } | null
}

function getInitials(email: string, name?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function Topbar({ title, subtitle, badge }: TopbarProps) {
  const [me, setMe] = useState<MeData | null>(null)

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {})
  }, [])

  const displayName = me?.funeralHome?.name ?? me?.email ?? "…"
  const initials = me ? getInitials(me.email, me.funeralHome?.name) : "…"

  return (
    <header className="sticky top-0 z-10 flex h-[72px] items-center gap-4 border-b bg-background px-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-[18px] font-semibold leading-none">{title}</h1>
        {(subtitle || badge) && (
          <div className="mt-1 flex items-center gap-2">
            {subtitle && <p className="text-[14px] text-muted-foreground">{subtitle}</p>}
            {badge}
          </div>
        )}
      </div>

      {/* Just who is signed in — settings, contact and logout all live in the sidebar. */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden flex-col items-start gap-0.5 md:flex">
          <span className="text-[13px] leading-none font-medium">{displayName}</span>
          <span className="text-[12px] leading-none text-muted-foreground">{me?.email ?? "…"}</span>
        </div>
      </div>
    </header>
  )
}
