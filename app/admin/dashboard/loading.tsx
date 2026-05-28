import { TopbarSkeleton } from "@/components/layout/topbar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminDashboardLoading() {
  return (
    <>
      <TopbarSkeleton />
      <div className="p-6 space-y-6">
        {/* Stat tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-[8px]" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
          <Card className="lg:col-span-2">
            <CardHeader className="border-b py-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-56" />
                </div>
                <Skeleton className="h-8 w-40 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pt-6">
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="p-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
