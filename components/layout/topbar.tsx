"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MoreHorizontal, LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const router = useRouter()
  const [me, setMe] = useState<MeData | null>(null)

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

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

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start gap-0.5">
              <span className="text-[13px] font-medium leading-none">{displayName}</span>
              <span className="text-[12px] text-muted-foreground leading-none">{me?.email ?? "…"}</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{me?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(me?.role === "admin" ? "/admin/settings" : "/funeral-home/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Ustawienia
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj się
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
