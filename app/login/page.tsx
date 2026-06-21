"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft } from "lucide-react"
import { FlowerTulip } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type Step = "email" | "code"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep("code")
      toast.success("Kod wysłany — sprawdź skrzynkę")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Błąd wysyłki kodu")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(data.role === "admin" ? "/admin/dashboard" : "/funeral-home/dashboard")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Błąd weryfikacji kodu")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <div className="flex items-center gap-2">
            <FlowerTulip className="h-8 w-8 text-primary" weight="duotone" />
            <h1 className="text-xl font-semibold tracking-tight">eMemories</h1>
          </div>
          <p className="text-sm text-muted-foreground">Platforma do tworzenia eNekrologów</p>
        </div>

        <div
          className="rounded-xl border bg-card shadow-sm p-6 space-y-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}
        >
          {step === "email" ? (
            <form
              key="email"
              onSubmit={handleSendCode}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="h-4 w-4" />
                {loading ? "Wysyłanie…" : "Wyślij kod logowania"}
              </Button>
            </form>
          ) : (
            <form
              key="code"
              onSubmit={handleVerifyCode}
              className="space-y-4"
            >
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">Kod wysłany na</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">6-cyfrowy kod</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoComplete="one-time-code"
                  autoFocus
                  className="text-center tracking-[0.5em] text-lg font-mono"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? "Weryfikacja…" : "Zaloguj się"}
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode("") }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Zmień adres e-mail
              </button>
            </form>
          )}
        </div>

        <p
          className="text-center text-xs text-muted-foreground px-2"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.3s",
          }}
        >
          Logując się do eMemories, potwierdzasz zapoznanie się z Regulaminem oraz Polityką Prywatności, w tym zasadami przetwarzania danych osobowych.
        </p>

        <p
          className="text-center text-xs text-muted-foreground"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.3s",
          }}
        >
          © 2026 eMemories.pl — wszelkie prawa zastrzeżone
        </p>
      </div>
    </div>
  )
}
