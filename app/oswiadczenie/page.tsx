import type { Metadata } from "next"
import { DeclarationText } from "@/components/declaration-text"
import { DECLARATION_TITLE, DECLARATION_VERSION } from "@/lib/declaration"

export const metadata: Metadata = {
  title: DECLARATION_TITLE,
  description:
    "Oświadczenie zakładu pogrzebowego o pozyskaniu i przekazaniu materiałów wykorzystywanych do utworzenia Strony Pamięci w Platformie eMemories.pl.",
}

export default function DeclarationPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{DECLARATION_TITLE}</h1>
      <p className="mt-2 text-xs text-muted-foreground">Wersja dokumentu: {DECLARATION_VERSION}</p>
      <div className="mt-8">
        <DeclarationText />
      </div>
    </main>
  )
}
