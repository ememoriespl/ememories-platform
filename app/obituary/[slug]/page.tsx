import { notFound } from "next/navigation"
import { Flower2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createServerClient } from "@/lib/supabase"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicObituaryPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: obit, error } = await supabase
    .from("obituaries")
    .select("*")
    .eq("id", slug)
    .eq("status", "published")
    .single()

  if (error || !obit) notFound()

  // Increment views (fire and forget)
  supabase
    .from("obituaries")
    .update({ views: obit.views + 1 })
    .eq("id", slug)
    .then(() => {})

  const fullName = `${obit.first_name} ${obit.last_name}`
  const initials = `${obit.first_name[0]}${obit.last_name[0]}`

  const dateRange = [obit.birth_date, obit.death_date]
    .filter(Boolean)
    .map((d: string) =>
      new Date(d).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })
    )
    .join(" — ")

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <Flower2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-semibold">eMemories</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-8 pt-8 pb-6 text-center space-y-3">
              {obit.photo_url ? (
                <img
                  src={obit.photo_url}
                  alt={fullName}
                  className="h-20 w-20 rounded-full object-cover mx-auto ring-4 ring-background"
                  style={obit.photo_bw ? { filter: "grayscale(100%)" } : {}}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold mx-auto ring-4 ring-background">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
                {dateRange && (
                  <p className="text-sm text-muted-foreground mt-1">{dateRange}</p>
                )}
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              {obit.obituary_text && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {obit.obituary_text}
                </p>
              )}

              {(obit.ceremony_info || obit.location) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Ceremonia pożegnalna
                    </p>
                    {obit.ceremony_info && (
                      <p className="text-sm">{obit.ceremony_info}</p>
                    )}
                    {obit.location && (
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">{obit.location}</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(obit.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors shrink-0"
                        >
                          Nawiguj
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Cyfrowy nekrolog wygenerowany przez{" "}
            <span className="font-medium">eMemories.pl</span>
          </p>
        </div>
      </main>
    </div>
  )
}
