"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner() {
  const router = useRouter()

  async function handleReturn() {
    await fetch("/api/admin/impersonate", { method: "DELETE" })
    router.push("/admin/clients")
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center gap-2 text-amber-800 text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>Przeglądasz panel jako klient (tryb podglądu administratora)</span>
      </div>
      <Button size="sm" color="secondary" className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100" onClick={handleReturn}>
        Wróć do admina
      </Button>
    </div>
  )
}
