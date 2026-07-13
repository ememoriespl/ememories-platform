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
  Libre_Baskerville,
  Bitter,
  Vollkorn,
  Domine,
  Alegreya,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Inter,
  Nunito,
  Raleway,
  Work_Sans,
  Rubik,
  Mulish,
  Ubuntu,
  Karla,
  DM_Sans,
  Source_Sans_3,
} from "next/font/google"

const playfairDisplay = Playfair_Display({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-playfair-display" })
const merriweather = Merriweather({ subsets: ["latin-ext"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-merriweather" })
const lora = Lora({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-lora" })
const ptSerif = PT_Serif({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-pt-serif" })
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin-ext"], weight: ["300", "400", "500", "600", "700"], variable: "--font-cormorant-garamond" })
const ebGaramond = EB_Garamond({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-eb-garamond" })
const crimsonPro = Crimson_Pro({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-crimson-pro" })
const sourceSerif4 = Source_Serif_4({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-source-serif-4" })
const notoSerif = Noto_Serif({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-noto-serif" })
const spectral = Spectral({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800"], variable: "--font-spectral" })
const libreBaskerville = Libre_Baskerville({ subsets: ["latin-ext"], weight: ["400", "700"], variable: "--font-libre-baskerville" })
const bitter = Bitter({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-bitter" })
const vollkorn = Vollkorn({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-vollkorn" })
const domine = Domine({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-domine" })
const alegreya = Alegreya({ subsets: ["latin-ext"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-alegreya" })

const roboto = Roboto({ subsets: ["latin-ext"], weight: ["100", "300", "400", "500", "700", "900"], variable: "--font-roboto" })
const openSans = Open_Sans({ subsets: ["latin-ext"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-open-sans" })
const lato = Lato({ subsets: ["latin-ext"], weight: ["100", "300", "400", "700", "900"], variable: "--font-lato" })
const montserrat = Montserrat({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-montserrat" })
const poppins = Poppins({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-poppins" })
const inter = Inter({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-inter" })
const nunito = Nunito({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-nunito" })
const raleway = Raleway({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-raleway" })
const workSans = Work_Sans({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-work-sans" })
const rubik = Rubik({ subsets: ["latin-ext"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-rubik" })
const mulish = Mulish({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-mulish" })
const ubuntu = Ubuntu({ subsets: ["latin-ext"], weight: ["300", "400", "500", "700"], variable: "--font-ubuntu" })
const karla = Karla({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800"], variable: "--font-karla" })
const dmSans = DM_Sans({ subsets: ["latin-ext"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-dm-sans" })
const sourceSans3 = Source_Sans_3({ subsets: ["latin-ext"], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: "--font-source-sans-3" })

export type FontCategory = "serif" | "sans-serif"

export interface PrintFontOption {
  id: string
  label: string
  category: FontCategory
  cssVar: string
  variableClassName: string
  weights: number[]
}

export const PRINT_FONTS: PrintFontOption[] = [
  // Serif
  { id: "playfair-display", label: "Playfair Display", category: "serif", cssVar: "--font-playfair-display", variableClassName: playfairDisplay.variable, weights: [400, 500, 600, 700, 800, 900] },
  { id: "merriweather", label: "Merriweather", category: "serif", cssVar: "--font-merriweather", variableClassName: merriweather.variable, weights: [300, 400, 500, 600, 700, 800, 900] },
  { id: "lora", label: "Lora", category: "serif", cssVar: "--font-lora", variableClassName: lora.variable, weights: [400, 500, 600, 700] },
  { id: "pt-serif", label: "PT Serif", category: "serif", cssVar: "--font-pt-serif", variableClassName: ptSerif.variable, weights: [400, 700] },
  { id: "cormorant-garamond", label: "Cormorant Garamond", category: "serif", cssVar: "--font-cormorant-garamond", variableClassName: cormorantGaramond.variable, weights: [300, 400, 500, 600, 700] },
  { id: "eb-garamond", label: "EB Garamond", category: "serif", cssVar: "--font-eb-garamond", variableClassName: ebGaramond.variable, weights: [400, 500, 600, 700, 800] },
  { id: "crimson-pro", label: "Crimson Pro", category: "serif", cssVar: "--font-crimson-pro", variableClassName: crimsonPro.variable, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "source-serif-4", label: "Source Serif 4", category: "serif", cssVar: "--font-source-serif-4", variableClassName: sourceSerif4.variable, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "noto-serif", label: "Noto Serif", category: "serif", cssVar: "--font-noto-serif", variableClassName: notoSerif.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "spectral", label: "Spectral", category: "serif", cssVar: "--font-spectral", variableClassName: spectral.variable, weights: [200, 300, 400, 500, 600, 700, 800] },
  { id: "libre-baskerville", label: "Libre Baskerville", category: "serif", cssVar: "--font-libre-baskerville", variableClassName: libreBaskerville.variable, weights: [400, 700] },
  { id: "bitter", label: "Bitter", category: "serif", cssVar: "--font-bitter", variableClassName: bitter.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "vollkorn", label: "Vollkorn", category: "serif", cssVar: "--font-vollkorn", variableClassName: vollkorn.variable, weights: [400, 500, 600, 700, 800, 900] },
  { id: "domine", label: "Domine", category: "serif", cssVar: "--font-domine", variableClassName: domine.variable, weights: [400, 500, 600, 700] },
  { id: "alegreya", label: "Alegreya", category: "serif", cssVar: "--font-alegreya", variableClassName: alegreya.variable, weights: [400, 500, 600, 700, 800, 900] },
  // Sans-serif
  { id: "roboto", label: "Roboto", category: "sans-serif", cssVar: "--font-roboto", variableClassName: roboto.variable, weights: [100, 300, 400, 500, 700, 900] },
  { id: "open-sans", label: "Open Sans", category: "sans-serif", cssVar: "--font-open-sans", variableClassName: openSans.variable, weights: [300, 400, 500, 600, 700, 800] },
  { id: "lato", label: "Lato", category: "sans-serif", cssVar: "--font-lato", variableClassName: lato.variable, weights: [100, 300, 400, 700, 900] },
  { id: "montserrat", label: "Montserrat", category: "sans-serif", cssVar: "--font-montserrat", variableClassName: montserrat.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "poppins", label: "Poppins", category: "sans-serif", cssVar: "--font-poppins", variableClassName: poppins.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "inter", label: "Inter", category: "sans-serif", cssVar: "--font-inter", variableClassName: inter.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "nunito", label: "Nunito", category: "sans-serif", cssVar: "--font-nunito", variableClassName: nunito.variable, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "raleway", label: "Raleway", category: "sans-serif", cssVar: "--font-raleway", variableClassName: raleway.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "work-sans", label: "Work Sans", category: "sans-serif", cssVar: "--font-work-sans", variableClassName: workSans.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "rubik", label: "Rubik", category: "sans-serif", cssVar: "--font-rubik", variableClassName: rubik.variable, weights: [300, 400, 500, 600, 700, 800, 900] },
  { id: "mulish", label: "Mulish", category: "sans-serif", cssVar: "--font-mulish", variableClassName: mulish.variable, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "ubuntu", label: "Ubuntu", category: "sans-serif", cssVar: "--font-ubuntu", variableClassName: ubuntu.variable, weights: [300, 400, 500, 700] },
  { id: "karla", label: "Karla", category: "sans-serif", cssVar: "--font-karla", variableClassName: karla.variable, weights: [200, 300, 400, 500, 600, 700, 800] },
  { id: "dm-sans", label: "DM Sans", category: "sans-serif", cssVar: "--font-dm-sans", variableClassName: dmSans.variable, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: "source-sans-3", label: "Source Sans 3", category: "sans-serif", cssVar: "--font-source-sans-3", variableClassName: sourceSans3.variable, weights: [200, 300, 400, 500, 600, 700, 800, 900] },
]

export const DEFAULT_PRINT_FONT_ID = "playfair-display"

export const PRINT_FONTS_CLASSNAME = PRINT_FONTS.map((f) => f.variableClassName).join(" ")

export function getPrintFont(fontId: string): PrintFontOption {
  return PRINT_FONTS.find((f) => f.id === fontId) ?? PRINT_FONTS[0]
}

export function getPrintFontFamily(fontId: string): string {
  const font = getPrintFont(fontId)
  const fallback = font.category === "sans-serif" ? "Arial, sans-serif" : "Georgia, 'Times New Roman', serif"
  return `var(${font.cssVar}), ${fallback}`
}

export function getClosestWeight(fontId: string, weight: number): number {
  const weights = getPrintFont(fontId).weights
  if (weights.includes(weight)) return weight
  return weights.reduce((closest, w) => (Math.abs(w - weight) < Math.abs(closest - weight) ? w : closest), weights[0])
}
