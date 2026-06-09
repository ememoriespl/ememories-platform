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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, BookOpen, Gauge } from "@phosphor-icons/react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface StatsData {
  activeClients: number
  totalObituaries: number
  totalQrUsed: number
  totalQrLimit: number
  chartData: { day: string; obituaries: number; clients: number }[]
  activityLog: { id: string; description: string; funeralHomeName: string; timestamp: string }[]
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

const timeRangeItems = [
  { label: "Ostatnie 7 dni", value: "7" },
  { label: "Ostatnie 14 dni", value: "14" },
  { label: "Ostatnie 30 dni", value: "30" },
  { label: "Ostatnie 45 dni", value: "45" },
  { label: "Ostatnie 60 dni", value: "60" },
]

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = React.useState("30")
  const [stats, setStats] = React.useState<StatsData | null>(null)

  React.useEffect(() => {
    fetch(`/api/admin/stats?days=${timeRange}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [timeRange])

  const qrPercent = stats
    ? Math.round((stats.totalQrUsed / Math.max(stats.totalQrLimit, 1)) * 100)
    : 0

  return (
    <>
      <Topbar title="Dashboard" subtitle="Przegląd platformy eMemories" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
                  style={{ backgroundColor: "color-mix(in oklch, var(--chart-2) 10%, transparent)" }}
                >
                  <Users className="h-6 w-6" weight="duotone" style={{ color: "var(--chart-2)" }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktywni klienci</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">
                    {stats ? stats.activeClients : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">domy pogrzebowe z aktywnym kontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
                  style={{ backgroundColor: "color-mix(in oklch, var(--chart-1) 10%, transparent)" }}
                >
                  <BookOpen className="h-6 w-6" weight="duotone" style={{ color: "var(--chart-1)" }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nekrologi</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">
                    {stats ? stats.totalObituaries : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">łącznie w systemie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
                  style={{ backgroundColor: "color-mix(in oklch, var(--foreground) 10%, transparent)" }}
                >
                  <Gauge className="h-6 w-6 text-foreground" weight="duotone" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wykorzystane nekrologi</p>
                  <p className="text-2xl font-semibold leading-none mt-0.5">
                    {stats ? `${qrPercent}%` : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats ? `${stats.totalQrUsed} z ${stats.totalQrLimit} łącznie` : "ładowanie…"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
          <Card className="lg:col-span-2 pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>Aktywność platformy</CardTitle>
                <CardDescription>Nekrologi dodane w wybranym okresie</CardDescription>
              </div>
              <Select items={timeRangeItems} value={timeRange} onValueChange={(v) => v && setTimeRange(v)}>
                <SelectTrigger className="w-[160px] sm:ml-auto" aria-label="Wybierz zakres">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                  <SelectGroup>
                    <SelectLabel>Zakres czasu</SelectLabel>
                    {timeRangeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                <AreaChart data={stats?.chartData ?? []} margin={{ top: 20, left: 0, right: 0, bottom: 0 }}>
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("pl-PL", { month: "short", day: "numeric" })
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("pl-PL", { month: "short", day: "numeric" })
                        }
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="obituaries"
                    type="monotone"
                    fill="url(#fillObituaries)"
                    stroke="var(--color-obituaries)"
                  />
                  <Area
                    dataKey="clients"
                    type="monotone"
                    fill="url(#fillClients)"
                    stroke="var(--color-clients)"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ostatnia aktywność</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {!stats ? (
                <p className="text-sm text-muted-foreground px-4 py-8 text-center">Ładowanie…</p>
              ) : stats.activityLog.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-8 text-center">Brak aktywności</p>
              ) : (
                <div className="divide-y">
                  {stats.activityLog.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.description}</p>
                        {item.funeralHomeName && (
                          <p className="text-xs text-muted-foreground truncate">{item.funeralHomeName}</p>
                        )}
                      </div>
                      <span className="text-[13px] text-muted-foreground shrink-0">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
