"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Flower2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Role = "admin" | "funeral-home"

const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@ememories.pl", password: "admin123" },
  "funeral-home": { email: "kontakt@ostatniadroga.pl", password: "demo123" },
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("funeral-home")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const creds = DEMO_CREDENTIALS[role]
      if (email === creds.email && password === creds.password) {
        router.push(role === "admin" ? "/admin/dashboard" : "/funeral-home/dashboard")
      } else {
        toast.error("Nieprawidłowy email lub hasło")
        setLoading(false)
      }
    }, 600)
  }

  function fillDemo() {
    const creds = DEMO_CREDENTIALS[role]
    setEmail(creds.email)
    setPassword(creds.password)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flower2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">eMemories</h1>
          <p className="text-sm text-muted-foreground">Platforma cyfrowych nekrologów</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
          {/* Role tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["funeral-home", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setEmail(""); setPassword("") }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  role === r
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "admin" ? "Administrator" : "Zakład pogrzebowy"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={DEMO_CREDENTIALS[role].email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Hasło</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Nie pamiętam hasła
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logowanie…" : "Zaloguj się"}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="rounded-lg bg-muted/60 px-3 py-2.5 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Dane demo</p>
            <p className="text-xs text-muted-foreground font-mono">{DEMO_CREDENTIALS[role].email}</p>
            <p className="text-xs text-muted-foreground font-mono">{DEMO_CREDENTIALS[role].password}</p>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs text-primary hover:underline mt-0.5"
            >
              Wypełnij automatycznie
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 eMemories.pl — wszelkie prawa zastrzeżone
        </p>
      </div>
    </div>
  )
}
