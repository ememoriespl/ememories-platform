"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const activityTypeBadge: Record<string, "default" | "secondary" | "outline"> = {
  obituary_created: "secondary",
  obituary_published: "default",
  client_created: "outline",
  qr_generated: "secondary",
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

const MAX_QR = 300

export default function AdminDashboardPage() {
  const [activeChart, setActiveChart] = useState<ActiveKey>("obituaries")

  const firstDay = mockChartData[0]?.day
  const lastDay = mockChartData[mockChartData.length - 1]?.day

  const totalObituaries = mockChartData.reduce((s, d) => s + d.obituaries, 0)
  const totalClients = mockChartData.reduce((s, d) => s + d.clients, 0)
  const qrPercent = Math.round((mockAdminMetrics.totalQrUsed / MAX_QR) * 100)

  return (
    <>
      <Topbar title="Dashboard" subtitle="Przegląd platformy eMemories" />

      <div className="p-6 space-y-6">
        {/* Stats — 3 kafelki */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Aktywni klienci</CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.activeClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+1</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Nekrologi</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.totalObituaries}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+23</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Zużycie nekrologów</CardDescription>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{qrPercent}%</CardTitle>
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
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[key].label}
                    </span>
                    <span className="text-xl font-semibold leading-none">
                      {key === "obituaries" ? totalObituaries : totalClients}
                    </span>
                    <span className="text-[11px] text-muted-foreground">ostatnie 30 dni</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={mockChartData} margin={{ left: 12, right: 12 }}>
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
                    interval={6}
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
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.funeralHomeName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={activityTypeBadge[item.type]} className="text-[10px] px-1.5 py-0">
                        {activityTypeLabel[item.type]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
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
