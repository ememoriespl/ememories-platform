import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createServerClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get("days") ?? "30", 10)

  const supabase = createServerClient()

  const [{ data: fhRows }, { data: obituaryRows }] = await Promise.all([
    supabase.from("funeral_homes").select("id, status, qr_limit, qr_used"),
    supabase.from("obituaries").select("id, status, created_at, funeral_home_id"),
  ])

  const activeClients = fhRows?.filter((f) => f.status === "active").length ?? 0
  const totalObituaries = obituaryRows?.length ?? 0
  const totalQrUsed = fhRows?.reduce((s, f) => s + (f.qr_used ?? 0), 0) ?? 0
  const totalQrLimit = fhRows?.reduce((s, f) => s + (f.qr_limit ?? 0), 0) ?? 0

  // Build daily chart: obituaries created per day for last `days` days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const dayCounts: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    dayCounts[d.toISOString().split("T")[0]] = 0
  }
  for (const o of obituaryRows ?? []) {
    const day = o.created_at?.split("T")[0]
    if (day && day in dayCounts) dayCounts[day]++
  }

  const chartData = Object.entries(dayCounts).map(([day, obituaries]) => ({ day, obituaries }))

  // Recent activity: last 20 obituaries
  const recentActivity = (obituaryRows ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  // Enrich with FH name
  const fhMap = Object.fromEntries((fhRows ?? []).map((f) => [f.id, f]))
  const { data: obitsWithNames } = await supabase
    .from("obituaries")
    .select("id, first_name, last_name, status, created_at, funeral_home_id, funeral_homes(name)")
    .order("created_at", { ascending: false })
    .limit(20)

  const activityLog = (obitsWithNames ?? []).map((o) => ({
    id: o.id,
    description: `${o.status === "published" ? "Opublikowano" : "Dodano szkic"}: ${o.first_name} ${o.last_name}`,
    funeralHomeName: (o.funeral_homes as any)?.name ?? "",
    timestamp: o.created_at,
  }))

  return NextResponse.json({
    activeClients,
    totalObituaries,
    totalQrUsed,
    totalQrLimit,
    chartData,
    activityLog,
  })
}
