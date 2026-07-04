import {
  Playfair_Display,
  Merriweather,
  Lora,
  PT_Serif,
  Cormorant_Garamond,
  EB_Garamond,
  Crimson_Pro,
  Source_Serif_4,
  Noto_Serif,
  Spectral,
} from "next/font/google"

const playfairDisplay = Playfair_Display({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-playfair-display" })
const merriweather = Merriweather({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-merriweather" })
const lora = Lora({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-lora" })
const ptSerif = PT_Serif({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-pt-serif" })
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-cormorant-garamond" })
const ebGaramond = EB_Garamond({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-eb-garamond" })
const crimsonPro = Crimson_Pro({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-crimson-pro" })
const sourceSerif4 = Source_Serif_4({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-source-serif-4" })
const notoSerif = Noto_Serif({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-noto-serif" })
const spectral = Spectral({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-spectral" })

export interface PrintFontOption {
  id: string
  label: string
  cssVar: string
  variableClassName: string
}

export const PRINT_FONTS: PrintFontOption[] = [
  { id: "playfair-display", label: "Playfair Display", cssVar: "--font-playfair-display", variableClassName: playfairDisplay.variable },
  { id: "merriweather", label: "Merriweather", cssVar: "--font-merriweather", variableClassName: merriweather.variable },
  { id: "lora", label: "Lora", cssVar: "--font-lora", variableClassName: lora.variable },
  { id: "pt-serif", label: "PT Serif", cssVar: "--font-pt-serif", variableClassName: ptSerif.variable },
  { id: "cormorant-garamond", label: "Cormorant Garamond", cssVar: "--font-cormorant-garamond", variableClassName: cormorantGaramond.variable },
  { id: "eb-garamond", label: "EB Garamond", cssVar: "--font-eb-garamond", variableClassName: ebGaramond.variable },
  { id: "crimson-pro", label: "Crimson Pro", cssVar: "--font-crimson-pro", variableClassName: crimsonPro.variable },
  { id: "source-serif-4", label: "Source Serif 4", cssVar: "--font-source-serif-4", variableClassName: sourceSerif4.variable },
  { id: "noto-serif", label: "Noto Serif", cssVar: "--font-noto-serif", variableClassName: notoSerif.variable },
  { id: "spectral", label: "Spectral", cssVar: "--font-spectral", variableClassName: spectral.variable },
]

export const DEFAULT_PRINT_FONT_ID = "playfair-display"

export const PRINT_FONTS_CLASSNAME = PRINT_FONTS.map((f) => f.variableClassName).join(" ")

export function getPrintFontFamily(fontId: string): string {
  const font = PRINT_FONTS.find((f) => f.id === fontId) ?? PRINT_FONTS[0]
  return `var(${font.cssVar}), Georgia, 'Times New Roman', serif`
}
