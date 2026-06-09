import { FhSidebar } from "@/components/layout/fh-sidebar"
import { ImpersonationBanner } from "@/components/layout/impersonation-banner"
import { cookies } from "next/headers"

export default async function FuneralHomeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isImpersonating = !!cookieStore.get("admin_return_session")

  return (
    <div className="flex h-screen overflow-hidden">
      <FhSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {isImpersonating && <ImpersonationBanner />}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
