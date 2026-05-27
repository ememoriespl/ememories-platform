import { Flower2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function PublicObituaryPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <Flower2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-semibold">eNekrolog</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-8 pt-8 pb-6 text-center space-y-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold mx-auto ring-4 ring-background">
                JK
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Jan Kowalski</h1>
                <p className="text-sm text-muted-foreground mt-1">15 marca 1945 — 20 maja 2024</p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              <p className="text-sm leading-relaxed">
                Z głębokim żalem zawiadamiamy o odejściu naszego ukochanego Ojca, Dziadka i Przyjaciela.
                Jan Kowalski przez całe życie służył innym z pokorą i serdecznością.
                Zostawił w naszych sercach ślad, który nigdy nie zniknie.
              </p>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Ceremonia pożegnalna
                </p>
                <p className="text-sm">Msza święta żałobna odbyła się 25 maja 2024 r. o godz. 11:00</p>
                <p className="text-sm text-muted-foreground">
                  Kościół pw. Wniebowzięcia NMP, ul. Kościelna 1, Warszawa
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Cyfrowy nekrolog wygenerowany przez{" "}
            <span className="font-medium">eNekrolog.pl</span>
          </p>
        </div>
      </main>
    </div>
  )
}
