"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/topbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  mockAdminMetrics,
  mockChartData,
  mockActivityLog,
} from "@/lib/mock-data"

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

const MAX_QR = 300

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = mockChartData.filter((item) => {
    const date = new Date(item.day)
    const referenceDate = new Date()
    const daysMap: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30, "45d": 45, "60d": 60 }
    const daysToSubtract = daysMap[timeRange] ?? 30
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const rangeLabel: Record<string, string> = {
    "7d": "Ostatnie 7 dni",
    "14d": "Ostatnie 14 dni",
    "30d": "Ostatnie 30 dni",
    "45d": "Ostatnie 45 dni",
    "60d": "Ostatnie 60 dni",
  }

  const qrPercent = Math.round((mockAdminMetrics.totalQrUsed / MAX_QR) * 100)

  return (
    <>
      <Topbar title="Dashboard" subtitle="Przegląd platformy eMemories" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 shrink-0 text-foreground" />
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
                <BookOpen className="h-12 w-12 shrink-0 text-foreground" />
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
                <QrCode className="h-12 w-12 shrink-0 text-foreground" />
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
          <Card className="lg:col-span-2 pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>Aktywność platformy</CardTitle>
                <CardDescription>Nekrologi i klienci w wybranym okresie</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={(v) => v && setTimeRange(v)}>
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Wybierz zakres"
                >
                  <SelectValue>{rangeLabel[timeRange]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl" alignItemWithTrigger={false} sideOffset={4}>
                  <SelectItem value="7d" className="rounded-lg">Ostatnie 7 dni</SelectItem>
                  <SelectItem value="14d" className="rounded-lg">Ostatnie 14 dni</SelectItem>
                  <SelectItem value="30d" className="rounded-lg">Ostatnie 30 dni</SelectItem>
                  <SelectItem value="45d" className="rounded-lg">Ostatnie 45 dni</SelectItem>
                  <SelectItem value="60d" className="rounded-lg">Ostatnie 60 dni</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="fillObituaries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-obituaries)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-obituaries)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-clients)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-clients)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("pl-PL", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("pl-PL", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="clients"
                    type="natural"
                    fill="url(#fillClients)"
                    stroke="var(--color-clients)"
                    stackId="a"
                  />
                  <Area
                    dataKey="obituaries"
                    type="natural"
                    fill="url(#fillObituaries)"
                    stroke="var(--color-obituaries)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
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
