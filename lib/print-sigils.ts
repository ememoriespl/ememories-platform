export interface PrintSigilOption {
  id: string
  label: string
  kind: "text" | "image"
  char?: string
  /** picker-thumbnail preview image; the actual print/preview render uses SIGIL_ICON_DATA instead */
  src?: string
}

export const PRINT_SIGILS: PrintSigilOption[] = [
  { id: "cross-latin", label: "Krzyż łaciński", kind: "text", char: "✝" },
  { id: "cross-outline-leaf", label: "Krzyż z liściem", kind: "image", src: "/sigils/cross-outline-leaf.svg" },
  { id: "cross-branch", label: "Krzyż z gałązką", kind: "image", src: "/sigils/cross-branch.svg" },
  { id: "wreath-cross", label: "Wieniec z krzyżem", kind: "image", src: "/sigils/wreath-cross.svg" },
  { id: "wreath-cross-brush", label: "Wieniec z krzyżem (szkicowy)", kind: "image", src: "/sigils/wreath-cross-brush.svg" },
  { id: "wreath-ribbon", label: "Wieniec ze wstążką", kind: "image", src: "/sigils/wreath-ribbon.svg" },
  { id: "ribbon", label: "Wstążka", kind: "image", src: "/sigils/ribbon.svg" },
  { id: "laurel-cross", label: "Gałązka z krzyżem", kind: "image", src: "/sigils/laurel-cross.svg" },
  { id: "crucifix-sketch-spiral", label: "Ukrzyżowanie (szkic)", kind: "image", src: "/sigils/crucifix-sketch-spiral.svg" },
  { id: "crucifix-brush", label: "Ukrzyżowanie (pędzel)", kind: "image", src: "/sigils/crucifix-brush.svg" },
  { id: "christ-crown-thorns", label: "Chrystus w koronie cierniowej", kind: "image", src: "/sigils/christ-crown-thorns.svg" },
  { id: "christ-crown-thorns-outline", label: "Chrystus w koronie cierniowej (kontur)", kind: "image", src: "/sigils/christ-crown-thorns-outline.svg" },
  { id: "christ-crown-thorns-dramatic", label: "Chrystus w koronie cierniowej (ekspresyjny)", kind: "image", src: "/sigils/christ-crown-thorns-dramatic.svg" },
  { id: "christ-halo", label: "Chrystus z aureolą", kind: "image", src: "/sigils/christ-halo.svg" },
  { id: "cross-linear-square", label: "Krzyż linearny z kwadratem", kind: "image", src: "/sigils/cross-linear-square.svg" },
  { id: "cross-slim", label: "Krzyż smukły", kind: "image", src: "/sigils/cross-slim.svg" },
  { id: "cross-hatched", label: "Krzyż kreskowany", kind: "image", src: "/sigils/cross-hatched.svg" },
  { id: "cross-thin", label: "Krzyż cienki", kind: "image", src: "/sigils/cross-thin.svg" },
]

export const DEFAULT_SIGIL_ID = "cross-latin"
export const DEFAULT_SIGIL_COLOR = "#555555"

export function getSigilOption(sigilId: string): PrintSigilOption {
  return PRINT_SIGILS.find((s) => s.id === sigilId) ?? PRINT_SIGILS[0]
}
