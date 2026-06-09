import { Flower2 } from "lucide-react"

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mx-auto mb-6">
          <Flower2 className="h-7 w-7 text-primary-foreground" />
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
