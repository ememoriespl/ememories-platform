"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  QrCode,
  BarChart2,
  FileText,
  Settings,
  Flower2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/funeral-home/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funeral-home/obituaries", label: "Nekrologi", icon: BookOpen },
  { href: "/funeral-home/qr", label: "Kody QR", icon: QrCode },
  { href: "/funeral-home/usage", label: "Użycie i limity", icon: BarChart2 },
  { href: "/funeral-home/templates", label: "Szablony", icon: FileText },
  { href: "/funeral-home/settings", label: "Ustawienia", icon: Settings },
]

export function FhSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Flower2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">eMemories</p>
          <p className="text-xs text-muted-foreground mt-0.5">Panel Zakładu</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[1rem] font-medium transition-colors",
                    active
                      ? "bg-foreground/[0.08] text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            DPL
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Dom Pogrzebowy</p>
            <p className="truncate text-xs text-muted-foreground">Ostatnia Droga</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
