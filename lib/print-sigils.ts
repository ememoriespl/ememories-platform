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
  { id: "cross-outline-leaf", label: "Krzyż z liściem", kind: "image", src: "/sigils/cross-outline-leaf.svg", aspect: 0.734, contentOnly: true },
  { id: "cross-branch", label: "Krzyż z gałązką", kind: "image", src: "/sigils/cross-branch.svg", aspect: 1.75, contentOnly: true },
  { id: "wreath-cross", label: "Wieniec z krzyżem", kind: "image", src: "/sigils/wreath-cross.svg", aspect: 1.069, contentOnly: true },
  { id: "wreath-cross-brush", label: "Wieniec z krzyżem (szkicowy)", kind: "image", src: "/sigils/wreath-cross-brush.svg", aspect: 1.043, contentOnly: true },
  { id: "wreath-ribbon", label: "Wieniec ze wstążką", kind: "image", src: "/sigils/wreath-ribbon.svg", aspect: 1.13, contentOnly: true },
  { id: "ribbon", label: "Wstążka", kind: "image", src: "/sigils/ribbon.svg", aspect: 0.577, contentOnly: true },
  { id: "laurel-cross", label: "Gałązka z krzyżem", kind: "image", src: "/sigils/laurel-cross.svg", aspect: 1.756, contentOnly: true },
]

export const DEFAULT_SIGIL_ID = "cross-latin"
export const DEFAULT_SIGIL_COLOR = "#555555"

export function getSigilOption(sigilId: string): PrintSigilOption {
  return PRINT_SIGILS.find((s) => s.id === sigilId) ?? PRINT_SIGILS[0]
}

export function getSigilsFor(scope: "graphic" | "content"): PrintSigilOption[] {
  return scope === "graphic" ? PRINT_SIGILS.filter((s) => !s.contentOnly) : PRINT_SIGILS
}
