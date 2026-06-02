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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== "funeral-home") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const funeralHomeId = await getFuneralHomeId(session.email)
  if (!funeralHomeId) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const patch: Record<string, unknown> = { ...body }

  if (body.status === "published") {
    patch.published_at = new Date().toISOString()
  }

  const supabase = createServerClient()

  // Check if we're publishing for first time (to increment qr_used)
  if (body.status === "published") {
    const { data: existing } = await supabase
      .from("obituaries")
      .select("status")
      .eq("id", id)
      .eq("funeral_home_id", funeralHomeId)
      .single()
    if (existing?.status !== "published") {
      await supabase.rpc("increment_qr_used", { fh_id: funeralHomeId })
    }
  }

  const { data, error } = await supabase
    .from("obituaries")
    .update(patch)
    .eq("id", id)
    .eq("funeral_home_id", funeralHomeId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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
    .from("obituaries")
    .delete()
    .eq("id", id)
    .eq("funeral_home_id", funeralHomeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
