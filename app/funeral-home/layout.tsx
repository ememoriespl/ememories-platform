import { FhSidebar } from "@/components/layout/fh-sidebar"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

export default async function FuneralHomeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  let funeralHome: { name: string; email: string } | null = null
  if (session?.role === "funeral-home") {
    const supabase = createServerClient()
    const { data } = await supabase
      .from("funeral_homes")
      .select("name, email")
      .eq("email", session.email)
      .single()
    funeralHome = data
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <FhSidebar funeralHome={funeralHome} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
