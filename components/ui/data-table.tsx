"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SortDir = "asc" | "desc" | null

export interface SortState {
  col: string
  dir: SortDir
}

export function useTableState(pageSize = 10) {
  const [sort, setSort] = useState<SortState>({ col: "", dir: null })
  const [page, setPage] = useState(1)

  function toggleSort(col: string) {
    setPage(1)
    setSort((prev) => {
      if (prev.col !== col) return { col, dir: "asc" }
      if (prev.dir === "asc") return { col, dir: "desc" }
      return { col: "", dir: null }
    })
  }

  function sortData<T>(data: T[], getVal: (row: T, col: string) => unknown): T[] {
    if (!sort.dir || !sort.col) return data
    return [...data].sort((a, b) => {
      const va = getVal(a, sort.col) ?? ""
      const vb = getVal(b, sort.col) ?? ""
      const cmp = String(va).localeCompare(String(vb), "pl", { numeric: true })
      return sort.dir === "asc" ? cmp : -cmp
    })
  }

  function paginate<T>(data: T[]) {
    const total = data.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    const items = data.slice(start, start + pageSize)
    return { items, total, totalPages, page: safePage, start, end: start + items.length }
  }

  return { sort, toggleSort, sortData, paginate, page, setPage }
}

export function SortIcon({ col, sort }: { col: string; sort: SortState }) {
  if (sort.col !== col || !sort.dir) {
    return <ChevronsUpDown className="ml-1 inline h-3 w-3 shrink-0 text-muted-foreground/40" />
  }
  if (sort.dir === "asc") return <ChevronUp className="ml-1 inline h-3 w-3 shrink-0" />
  return <ChevronDown className="ml-1 inline h-3 w-3 shrink-0" />
}

interface SortHeadProps {
  col: string
  sort: SortState
  onSort: (col: string) => void
  className?: string
  children: React.ReactNode
}

export function SortHead({ col, sort, onSort, className, children }: SortHeadProps) {
  const active = sort.col === col && !!sort.dir
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-sm font-medium text-muted-foreground select-none whitespace-nowrap",
        className
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-0 hover:text-foreground transition-colors",
          active && "text-foreground"
        )}
        onClick={() => onSort(col)}
      >
        {children}
        <SortIcon col={col} sort={sort} />
      </button>
    </th>
  )
}

interface TablePaginationProps {
  total: number
  start: number
  end: number
  page: number
  totalPages: number
  onPage: (p: number) => void
  /** Optional note shown between the record count and the page controls. */
  children?: React.ReactNode
}

export function TablePagination({ total, start, end, page, totalPages, onPage, children }: TablePaginationProps) {
  return (
    // Marked as the card's footer so the card drops its bottom padding: the row then sits
    // flush with the card's edge and its own symmetric padding centres the content between
    // the separator above and that edge below.
    <div
      data-slot="card-footer"
      className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground"
    >
      {/* The two ends share the leftover space equally, so a note between them lands on the
          row's centre line rather than in the middle of the gap. */}
      <span className="min-w-0 flex-1">
        {total === 0 ? "Brak wyników" : `${start + 1}–${end} z ${total}`}
      </span>
      {children && <div className="shrink-0 px-4 text-center">{children}</div>}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="h-3 w-3" />
          Poprzednia
        </Button>
        <span className="px-2 text-xs">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Następna
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
