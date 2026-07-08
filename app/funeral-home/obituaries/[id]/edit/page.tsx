"use client"

import { useState, useEffect, use } from "react"
import { Topbar } from "@/components/layout/topbar"
import { ObituaryForm, type ObituaryRaw } from "@/components/funeral-home/obituary-form"
import { toast } from "sonner"

export default function EditObituaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [raw, setRaw] = useState<ObituaryRaw | null>(null)
  const [fhAddress, setFhAddress] = useState("")
  const [fhName, setFhName] = useState("")
  const [fhPhone, setFhPhone] = useState("")
  const [backUrl, setBackUrl] = useState("/funeral-home/dashboard")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const meReq = fetch("/api/auth/me").then((r) => r.json())
    const obituaryReq = fetch(`/api/obituaries/${id}`).then((r) => r.json())

    Promise.all([obituaryReq, meReq])
      .then(([o, me]) => {
        setRaw(o)
        if (me?.role === "admin") {
          setIsAdmin(true)
          setBackUrl("/admin/obituaries")
          setFhAddress(o?.funeral_homes?.address ?? "")
          setFhName(o?.funeral_homes?.name ?? "")
          setFhPhone(o?.funeral_homes?.phone ?? "")
        } else {
          fetch("/api/funeral-home/me")
            .then((r) => r.json())
            .then((fh) => {
              setFhAddress(fh?.address ?? "")
              setFhName(fh?.name ?? "")
              setFhPhone(fh?.phone ?? "")
            })
            .catch(() => {})
        }
      })
      .catch(() => toast.error("Nie udało się załadować nekrologu"))
  }, [id])

  const subtitle = raw ? `${raw.first_name ?? ""} ${raw.last_name ?? ""}`.trim() : ""

  return (
    <>
      <Topbar title="Edycja nekrologu" subtitle={subtitle} />
      {raw ? (
        <ObituaryForm
          mode="edit"
          obituaryId={id}
          initialRaw={raw}
          fhAddress={fhAddress}
          fhName={fhName}
          fhPhone={fhPhone}
          backUrl={backUrl}
          isAdmin={isAdmin}
        />
      ) : (
        <div className="p-6 text-sm text-muted-foreground">Ładowanie…</div>
      )}
    </>
  )
}
