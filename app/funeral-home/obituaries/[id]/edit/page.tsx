"use client"

import { useState, useEffect, use } from "react"
import { Topbar } from "@/components/layout/topbar"
import { ObituaryForm, type ObituaryRaw } from "@/components/funeral-home/obituary-form"
import { toast } from "sonner"

export default function EditObituaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [raw, setRaw] = useState<ObituaryRaw | null>(null)
  const [fhAddress, setFhAddress] = useState("")
  const [backUrl, setBackUrl] = useState("/funeral-home/dashboard")

  useEffect(() => {
    const meReq = fetch("/api/auth/me").then((r) => r.json())
    const obituaryReq = fetch(`/api/obituaries/${id}`).then((r) => r.json())

    Promise.all([obituaryReq, meReq])
      .then(([o, me]) => {
        setRaw(o)
        if (me?.role === "admin") {
          setBackUrl("/admin/obituaries")
        } else {
          fetch("/api/funeral-home/me")
            .then((r) => r.json())
            .then((fh) => setFhAddress(fh?.address ?? ""))
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
        <ObituaryForm mode="edit" obituaryId={id} initialRaw={raw} fhAddress={fhAddress} backUrl={backUrl} />
      ) : (
        <div className="p-6 text-sm text-muted-foreground">Ładowanie…</div>
      )}
    </>
  )
}
