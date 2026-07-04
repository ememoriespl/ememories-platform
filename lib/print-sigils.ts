export interface PrintSigilOption {
  id: string
  label: string
  char: string
}

export const PRINT_SIGILS: PrintSigilOption[] = [
  { id: "cross-latin", label: "Krzyż łaciński", char: "✝" },
  { id: "cross-orthodox", label: "Krzyż prawosławny", char: "☦" },
  { id: "cross-outline", label: "Krzyż ozdobny", char: "✙" },
  { id: "star-of-david", label: "Gwiazda Dawida", char: "✡" },
  { id: "flower", label: "Kwiat", char: "❀" },
]

export const DEFAULT_SIGIL_ID = "cross-latin"

export function getSigilChar(sigilId: string): string {
  return PRINT_SIGILS.find((s) => s.id === sigilId)?.char ?? PRINT_SIGILS[0].char
}
