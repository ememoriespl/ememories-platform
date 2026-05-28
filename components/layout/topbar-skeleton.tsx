import { Skeleton } from "@/components/ui/skeleton"

export function TopbarSkeleton() {
  return (
    <header className="sticky top-0 z-10 flex h-[72px] items-center gap-4 border-b bg-background px-6">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-lg" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </header>
  )
}
