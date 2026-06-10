"use client"

import { FlowerTulip } from "@phosphor-icons/react"

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <FlowerTulip className="h-8 w-8 text-primary" weight="duotone" />
          <span className="text-xl font-semibold tracking-tight">eMemories</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Konto nieaktywne</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Twoje konto zostało dezaktywowane przez administratora. Skontaktuj się z nami, aby przywrócić dostęp.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          <a href="mailto:admin@ememories.pl" className="text-primary underline underline-offset-4">
            admin@ememories.pl
          </a>
        </p>
      </div>
    </div>
  )
}
