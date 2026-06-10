"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BookOpen,
} from "lucide-react"
import { FlowerTulip } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Klienci", icon: Users },
  { href: "/admin/obituaries", label: "Nekrologi", icon: BookOpen },
{ href: "/admin/templates", label: "Szablony", icon: FileText },
  { href: "/admin/settings", label: "Ustawienia", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      <div className="flex h-[72px] items-center gap-2.5 px-6 border-b">
        <FlowerTulip className="h-7 w-7 text-primary" weight="duotone" />
        <p className="text-[18px] font-semibold leading-none">eMemories</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
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

    </aside>
  )
}
