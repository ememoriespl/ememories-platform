import { TopbarSkeleton } from "@/components/layout/topbar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminClientsLoading() {
  return (
    <>
      <TopbarSkeleton />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="p-0">
            {/* Table header */}
            <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20 ml-auto" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
