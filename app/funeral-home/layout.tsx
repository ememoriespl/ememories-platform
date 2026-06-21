import { redirect } from "next/navigation"
import { FhSidebar } from "@/components/layout/fh-sidebar"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { ImpersonationBanner } from "@/components/layout/impersonation-banner"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export default async function FuneralHomeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || (session.role !== "funeral-home" && session.role !== "admin")) {
    redirect("/login")
  }

  const cookieStore = await cookies()
  const isImpersonating = !!cookieStore.get("admin_return_session")

  if (!isImpersonating && session.role !== "admin") {
    const supabase = createServerClient()
    const { data: fh } = await supabase
      .from("funeral_homes")
      .select("status")
      .eq("email", session.email)
      .single()

    if (fh && fh.status !== "active") {
      redirect("/suspended")
    }
  }

  const isAdmin = session.role === "admin" && !isImpersonating

  return (
    <div className="flex h-screen overflow-hidden">
      {isAdmin ? <AdminSidebar /> : <FhSidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        {isImpersonating && <ImpersonationBanner />}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
