import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("funeral_homes")
    .select("id, name, nip, email, phone, address, status, qr_limit, qr_used")
    .eq("email", session.email)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: obituaries } = await supabase
    .from("obituaries")
    .select("status")
    .eq("funeral_home_id", data.id)

  const total = obituaries?.length ?? 0
  const published = obituaries?.filter((o) => o.status === "published").length ?? 0
  const draft = obituaries?.filter((o) => o.status === "draft").length ?? 0

  return NextResponse.json({ ...data, obituaries: { total, published, draft } })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  // Only phone and address can be updated by the client
  const { phone, address } = body

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("funeral_homes")
    .update({ phone, address })
    .eq("email", session.email)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
