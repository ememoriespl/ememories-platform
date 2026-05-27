"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { mockChartData, mockFuneralHomes } from "@/lib/mock-data"

export default function UsagePage() {
  return (
    <>
      <Topbar title="Użycie platformy" subtitle="Statystyki zużycia zasobów" />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nekrologi i QR — trend</CardTitle>
            <CardDescription>Łączne użycie w ostatnich 5 miesiącach</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockChartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="obituariesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="qrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="obituaries"
                  stroke="hsl(var(--foreground))"
                  fill="url(#obituariesGrad)"
                  strokeWidth={2}
                  name="Nekrologi"
                />
                <Area
                  type="monotone"
                  dataKey="qrUsed"
                  stroke="hsl(var(--muted-foreground))"
                  fill="url(#qrGrad)"
                  strokeWidth={2}
                  name="Kody QR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Użycie QR per klient</CardTitle>
            <CardDescription>Procentowe zużycie limitu QR dla każdego zakładu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {mockFuneralHomes.map((client) => {
              const pct = Math.round((client.qrUsed / client.qrLimit) * 100)
              return (
                <div key={client.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">
                        {client.qrUsed} / {client.qrLimit}
                      </span>
                      <Badge
                        variant={
                          pct >= 90
                            ? "destructive"
                            : pct >= 70
                            ? "secondary"
                            : "outline"
                        }
                        className="w-14 justify-center"
                      >
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 ${pct >= 90 ? "[&>div]:bg-destructive" : pct >= 70 ? "[&>div]:bg-amber-500" : ""}`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
