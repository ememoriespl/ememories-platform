import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

async function getFuneralHomeId(email: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("funeral_homes")
    .select("id")
    .eq("email", email)
    .single()
  return data?.id ?? null
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const supabase = createServerClient()
  const { error } = await supabase
    .from("print_templates")
    .delete()
    .eq("id", id)
    .eq("funeral_home_id", funeralHomeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
