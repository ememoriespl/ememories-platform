export interface PrintSigilOption {
  id: string
  label: string
  kind: "text" | "image"
  char?: string
  src?: string
  /** width / height ratio, used to size the mask box for non-square image sigils */
  aspect?: number
  /** only offered in the content-column picker, not the graphic-column one */
  contentOnly?: boolean
}

export const PRINT_SIGILS: PrintSigilOption[] = [
  { id: "cross-latin", label: "Krzyż łaciński", kind: "text", char: "✝" },
  { id: "cross-orthodox", label: "Krzyż prawosławny", kind: "text", char: "☦" },
  { id: "cross-outline", label: "Krzyż ozdobny", kind: "text", char: "✙" },
  { id: "star-of-david", label: "Gwiazda Dawida", kind: "text", char: "✡" },
  { id: "flower", label: "Kwiat", kind: "text", char: "❀" },
  { id: "wreath-cross", label: "Wieniec z krzyżem", kind: "image", src: "/sigils/wreath-cross.svg", contentOnly: true },
  { id: "cross-leaf", label: "Krzyż z liściem", kind: "image", src: "/sigils/cross-leaf.svg", aspect: 1.25, contentOnly: true },
  { id: "sp-wreath", label: "Ś.P. z wieńcem", kind: "image", src: "/sigils/sp-wreath.svg", aspect: 1.33, contentOnly: true },
  { id: "cross-leaves", label: "Krzyż z liśćmi", kind: "image", src: "/sigils/cross-leaves.svg", aspect: 1.18, contentOnly: true },
  { id: "laurel-cross", label: "Gałązki laurowe z krzyżem", kind: "image", src: "/sigils/laurel-cross.svg", aspect: 3.5, contentOnly: true },
]

export const DEFAULT_SIGIL_ID = "cross-latin"
export const DEFAULT_SIGIL_COLOR = "#555555"

export function getSigilOption(sigilId: string): PrintSigilOption {
  return PRINT_SIGILS.find((s) => s.id === sigilId) ?? PRINT_SIGILS[0]
}

export function getSigilsFor(scope: "graphic" | "content"): PrintSigilOption[] {
  return scope === "graphic" ? PRINT_SIGILS.filter((s) => !s.contentOnly) : PRINT_SIGILS
}
