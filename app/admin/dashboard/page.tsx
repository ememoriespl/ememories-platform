"use client"

import { Topbar } from "@/components/layout/topbar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  BookOpen,
  QrCode,
  CheckCircle,
  TrendingUp,
  Activity,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"
import {
  mockAdminMetrics,
  mockChartData,
  mockActivityLog,
  mockObituaries,
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminDashboardPage() {
  const recentObituaries = mockObituaries.slice(0, 5)

  return (
    <>
      <Topbar title="Dashboard" subtitle="Przegląd platformy eNekrolog" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Zakłady pogrzebowe</CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.totalFuneralHomes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+1</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Wszystkie nekrologi</CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.totalObituaries}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+23</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Kody QR użyte</CardDescription>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.totalQrUsed}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+22</span> w tym miesiącu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Aktywni klienci</CardDescription>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{mockAdminMetrics.activeClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                z {mockAdminMetrics.totalFuneralHomes} łącznie
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nekrologi — ostatnie 5 miesięcy</CardTitle>
              <CardDescription>Liczba utworzonych nekrologów miesięcznie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockChartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
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
                  <Line
                    type="monotone"
                    dataKey="obituaries"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--foreground))" }}
                    name="Nekrologi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Użycie QR — ostatnie 5 miesięcy</CardTitle>
              <CardDescription>Liczba wygenerowanych kodów QR miesięcznie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockChartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
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
                  <Bar dataKey="qrUsed" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} name="Kody QR" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom tables */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Activity log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Ostatnia aktywność</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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

          {/* Recent obituaries */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Ostatnio dodane nekrologi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentObituaries.map((obit) => (
                  <div key={obit.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {obit.firstName[0]}{obit.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{obit.firstName} {obit.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{obit.funeralHomeName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={
                          obit.status === "published"
                            ? "default"
                            : obit.status === "draft"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {obit.status === "published"
                          ? "Opublikowany"
                          : obit.status === "draft"
                          ? "Szkic"
                          : "Archiwalny"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(obit.createdAt).toLocaleDateString("pl-PL")}
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
