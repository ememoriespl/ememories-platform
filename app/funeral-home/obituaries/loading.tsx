import { TopbarSkeleton } from "@/components/layout/topbar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ObituariesLoading() {
  return (
    <>
      <TopbarSkeleton />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg ml-auto" />
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex gap-6 border-b bg-muted/40 px-4 py-3">
              {[48, 20, 24, 16, 24, 20, 12].map((w, i) => (
                <Skeleton key={i} className={`h-3 w-${w}`} />
              ))}
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-4 py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-7 rounded-md ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
