"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LifeBuoy, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoLight, LogoBirdLight } from "@/components/logo"
import { useSupport } from "@/components/support/support-context"

const navItems = [
  { href: "/funeral-home/dashboard", label: "Nekrologi", icon: BookOpen },
  { href: "/funeral-home/settings", label: "Ustawienia", icon: Settings },
]

export function FhSidebar() {
  const pathname = usePathname()
  const support = useSupport()

  return (
    <aside className="group fixed inset-y-0 left-0 z-30 flex h-screen w-[72px] flex-col overflow-hidden border-r bg-white transition-[width] duration-200 ease-in-out hover:w-60">
      <div className="flex h-[72px] shrink-0 items-center overflow-hidden border-b pl-6">
        <div className="relative shrink-0" style={{ height: 28 }}>
          <LogoBirdLight style={{ height: 28, width: "auto" }} className="block" />
          <LogoLight
            style={{ height: 28, width: "auto" }}
            className="absolute top-0 left-0 block opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[1rem] font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* People report a problem the moment they hit it, so the trigger sits where they are. */}
      {support && (
        <div className="shrink-0 px-3 pb-4">
          <button
            type="button"
            onClick={support.open}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[1rem] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LifeBuoy className="h-5 w-5 shrink-0" />
            <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Kontakt
            </span>
          </button>
        </div>
      )}
    </aside>
  )
}
