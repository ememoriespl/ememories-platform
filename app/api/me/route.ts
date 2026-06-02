import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (session.role === "admin") {
    return NextResponse.json({ email: session.email, role: "admin", funeralHome: null })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from("funeral_homes")
    .select("id, name, email, phone, address, status, qr_limit, qr_used")
    .eq("email", session.email)
    .single()

  return NextResponse.json({ email: session.email, role: "funeral-home", funeralHome: data })
}
