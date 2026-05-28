import { TopbarSkeleton } from "@/components/layout/topbar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <TopbarSkeleton />
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
