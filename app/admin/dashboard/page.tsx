"use client"

import { useState, useMemo } from "react"
import { Topbar } from "@/components/layout/topbar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  BookOpen,
  QrCode,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  mockAdminMetrics,
  mockChartData,
  mockActivityLog,
} from "@/lib/mock-data"

const activityTypeLabel: Record<string, string> = {
  obituary_created: "Nekrolog utworzony",
  obituary_published: "Nekrolog opublikowany",
  client_created: "Klient zarejestrowany",
  qr_generated: "QR wygenerowany",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const chartConfig = {
  obituaries: {
    label: "Nekrologi",
    color: "var(--chart-1)",
  },
  clients: {
    label: "Klienci",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type ActiveKey = "obituaries" | "clients"
type TimeRange = "7" | "30" | "90"

const MAX_QR = 300

export default function AdminDashboardPage() {
  const [activeChart, setActiveChart] = useState<ActiveKey>("obituaries")
  const [timeRange, setTimeRange] = useState<TimeRange>("30")

  const filteredData = useMemo(() => {
    const days = parseInt(timeRange)
    return mockChartData.slice(-days)
  }, [timeRange])

  const firstDay = filteredData[0]?.day
  const lastDay = filteredData[filteredData.length - 1]?.day

  const totalObituaries = filteredData.reduce((s, d) => s + d.obituaries, 0)
  const totalClients = filteredData.reduce((s, d) => s + d.clients, 0)
  const qrPercent = Math.round((mockAdminMetrics.totalQrUsed / MAX_QR) * 100)

  return (
    <>
      <Topbar title="Dashboard" subtitle="Przegląd platformy eMemories" />

      <div className="p-6 space-y-6">
        {/* Stats — 3 kafelki */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <Users className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktywni klienci</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{mockAdminMetrics.activeClients}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+1</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <BookOpen className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nekrologi</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{mockAdminMetrics.totalObituaries}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+23</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <QrCode className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zużycie nekrologów</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">{qrPercent}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {mockAdminMetrics.totalQrUsed} z {MAX_QR} łącznie
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Interactive Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-0 border-b p-0">
              <div className="flex">
                {(["obituaries", "clients"] as ActiveKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className={`flex flex-1 flex-col items-start gap-1 border-r px-6 py-4 text-left transition-colors last:border-r-0 hover:bg-muted/30 ${
                      activeChart === key ? "bg-muted/20" : ""
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">{chartConfig[key].label}</span>
                    <span className="text-xl font-semibold leading-none">
                      {key === "obituaries" ? totalObituaries : totalClients}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ostatnie {timeRange} dni
                    </span>
                  </button>
                ))}
                {/* Time range selector */}
                <div className="flex items-center gap-1 px-4">
                  {(["7", "30", "90"] as TimeRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeRange === r
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {r}d
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-6 sm:px-6">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 10, left: 16, right: 16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--color-${activeChart})`} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={`var(--color-${activeChart})`} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={timeRange === "7" ? 0 : timeRange === "30" ? 6 : 14}
                    padding={{ left: 8, right: 8 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey={activeChart}
                    type="natural"
                    fill="url(#fillActive)"
                    stroke={`var(--color-${activeChart})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {firstDay} – {lastDay}
            </CardFooter>
          </Card>

          {/* Activity log */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Ostatnia aktywność</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y">
                {mockActivityLog.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <p className="text-sm font-medium truncate">{item.description}</p>
                    <span className="text-[13px] text-muted-foreground shrink-0">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
