"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { ObituaryForm } from "@/components/funeral-home/obituary-form"

export default function NewObituaryPage() {
  const [fhAddress, setFhAddress] = useState("")

  useEffect(() => {
    fetch("/api/funeral-home/me")
      .then((r) => r.json())
      .then((fh) => setFhAddress(fh?.address ?? ""))
      .catch(() => {})
  }, [])

  return (
    <>
      <Topbar title="Nowy nekrolog" subtitle="Wypełnij dane i opublikuj" />
      <ObituaryForm mode="new" fhAddress={fhAddress} />
    </>
  )
}
