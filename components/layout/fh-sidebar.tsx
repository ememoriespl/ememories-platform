"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoDark } from "@/components/logo"

const navItems = [
  { href: "/funeral-home/dashboard", label: "Nekrologi", icon: BookOpen },
  { href: "/funeral-home/settings", label: "Ustawienia", icon: Settings },
]

export function FhSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col bg-black">
      <div className="flex h-[72px] items-center px-6 border-b border-white/10">
        <LogoDark />
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
                      ? "bg-[#7331df]/30 text-white font-semibold"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", active && "text-[#7331df]")} />
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
