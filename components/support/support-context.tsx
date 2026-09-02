"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { SupportDrawer } from "@/components/support/support-drawer"

interface SupportApi {
  open: () => void
}

const SupportContext = createContext<SupportApi | null>(null)

/** Null outside the provider, so shared chrome can hide the trigger where support isn't mounted. */
export function useSupport() {
  return useContext(SupportContext)
}

/** Last few console errors, so a bug report carries them without the reporter copying anything. */
const consoleErrors: string[] = []

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const original = console.error
    console.error = (...args: unknown[]) => {
      try {
        const line = args
          .map((a) => (a instanceof Error ? `${a.name}: ${a.message}` : String(a)))
          .join(" ")
          .slice(0, 300)
        consoleErrors.push(line)
        if (consoleErrors.length > 5) consoleErrors.shift()
      } catch {
        // never let reporting break the app
      }
      original(...args)
    }
    return () => {
      console.error = original
    }
  }, [])

  const api = useCallback(() => setOpen(true), [])

  return (
    <SupportContext.Provider value={{ open: api }}>
      {children}
      <SupportDrawer open={open} onOpenChange={setOpen} consoleErrors={consoleErrors} />
    </SupportContext.Provider>
  )
}
