"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { ObituaryForm } from "@/components/funeral-home/obituary-form"

export default function NewObituaryPage() {
  const [fhAddress, setFhAddress] = useState("")
  const [fhName, setFhName] = useState("")
  const [fhPhone, setFhPhone] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((me) => {
        if (me?.role === "admin") {
          setIsAdmin(true)
          return
        }
        fetch("/api/funeral-home/me")
          .then((r) => r.json())
          .then((fh) => {
            setFhAddress(fh?.address ?? "")
            setFhName(fh?.name ?? "")
            setFhPhone(fh?.phone ?? "")
          })
          .catch(() => {})
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <Topbar title="Nowy nekrolog" subtitle="Wypełnij dane i opublikuj" />
      <ObituaryForm mode="new" fhAddress={fhAddress} fhName={fhName} fhPhone={fhPhone} isAdmin={isAdmin} />
    </>
  )
}
