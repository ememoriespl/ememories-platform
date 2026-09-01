// Single source for the user declaration: the public page at /oswiadczenie and the acceptance
// dialog in the obituary editor both render this, and acceptances are recorded against
// DECLARATION_VERSION. Bump the version whenever the wording changes — funeral homes are then
// asked to accept again, and the old acceptances stay on record against the text they saw.
export const DECLARATION_VERSION = "2026-08-20"

export const DECLARATION_TITLE =
  "Oświadczenie użytkownika Platformy eMemories.pl o pozyskaniu i przekazaniu materiałów"

export const DECLARATION_INTRO =
  "Niniejsze oświadczenie składa Użytkownik Platformy eMemories.pl w związku z przekazaniem Platformie materiałów przeznaczonych do utworzenia, publikacji, utrzymywania lub archiwizacji Strony Pamięci Osoby Zmarłej."

export interface DeclarationSection {
  title: string
  paragraphs: string[]
  items?: string[]
  /** Paragraphs printed after the lettered list. */
  after?: string[]
}

export const DECLARATION_SECTIONS: DeclarationSection[] = [
  {
    title: "1. Oświadczenie Użytkownika",
    paragraphs: [
      "Użytkownik oświadcza, że materiały przekazane Platformie eMemories.pl zostały pozyskane przez Użytkownika od osoby, która według wiedzy i ustaleń Użytkownika jest uprawniona do ich przekazania w związku z organizacją ceremonii pogrzebowej lub upamiętnieniem Osoby Zmarłej.",
      "Użytkownik oświadcza, że przed przekazaniem materiałów Platformie eMemories.pl dołożył należytej staranności w celu ustalenia, że osoba przekazująca materiały jest uprawniona do ich przekazania oraz do zlecenia ich wykorzystania w celu utworzenia i prowadzenia Strony Pamięci Osoby Zmarłej.",
    ],
  },
  {
    title: "2. Prawo do przekazania materiałów",
    paragraphs: [
      "Użytkownik oświadcza, że posiada odpowiednią podstawę do przekazania Platformie eMemories.pl materiałów otrzymanych od osoby uprawnionej, w zakresie niezbędnym do realizacji usługi świadczonej przez Platformę.",
      "W szczególności Użytkownik oświadcza, że w zakresie, w jakim przekazane materiały są chronione prawem autorskim, prawami pokrewnymi, prawem do wizerunku, dobrami osobistymi lub innymi prawami osób trzecich, posiada odpowiednie uprawnienia, zgody lub zezwolenia umożliwiające ich przekazanie oraz wykorzystanie w ramach Strony Pamięci zgodnie z Regulaminem Platformy eMemories.pl.",
    ],
  },
  {
    title: "3. Materiały zawierające wizerunek osób żyjących",
    paragraphs: [
      "Użytkownik zobowiązuje się do przekazywania Platformie eMemories.pl wyłącznie takich materiałów zawierających wizerunek osób żyjących, co do których posiada odpowiednią podstawę prawną lub zgodę umożliwiającą ich wykorzystanie i publikację w ramach Strony Pamięci, zgodnie z jej zakresem publikacji.",
      "W przypadku braku odpowiedniej podstawy Użytkownik zobowiązuje się nie przekazywać takiego materiału Platformie albo zapewnić jego odpowiednie przygotowanie przed przekazaniem, w szczególności poprzez usunięcie lub anonimizację wizerunku osoby, której dotyczy ograniczenie.",
    ],
  },
  {
    title: "4. Materiały objęte prawami autorskimi",
    paragraphs: [
      "Użytkownik oświadcza, że w przypadku materiałów, w szczególności fotografii, nagrań, tekstów, grafik lub innych utworów, do których prawa mogą przysługiwać osobom trzecim, posiada odpowiednie uprawnienie do ich przekazania oraz wykorzystania w zakresie niezbędnym do realizacji Strony Pamięci.",
      "Użytkownik zobowiązuje się nie przekazywać Platformie materiałów, co do których istnieją uzasadnione wątpliwości dotyczące prawa do ich wykorzystania.",
    ],
  },
  {
    title: "5. Zakres wykorzystania materiałów",
    paragraphs: ["Użytkownik przekazuje materiały Platformie eMemories.pl wyłącznie w celu:"],
    items: [
      "a) utworzenia Strony Pamięci Osoby Zmarłej;",
      "b) publikacji Strony Pamięci zgodnie z wybranym przez Użytkownika zakresem dostępności;",
      "c) utrzymywania i aktualizacji Strony Pamięci;",
      "d) technicznego przechowywania i zabezpieczenia materiałów;",
      "e) archiwizacji materiałów zgodnie z Regulaminem Platformy eMemories.pl.",
    ],
    after: [
      "Platforma eMemories.pl nie jest uprawniona do wykorzystywania przekazanych materiałów w celach reklamowych, marketingowych lub promocyjnych niezwiązanych z prowadzeniem Strony Pamięci, chyba że odrębna podstawa prawna lub zgoda obejmuje takie wykorzystanie.",
    ],
  },
  {
    title: "6. Odpowiedzialność Użytkownika",
    paragraphs: [
      "Użytkownik ponosi odpowiedzialność za prawidłowość przekazania Platformie eMemories.pl materiałów oraz za posiadanie odpowiednich uprawnień, zgód lub zezwoleń wymaganych do ich przekazania i wykorzystania w zakresie określonym niniejszym oświadczeniem.",
      "W przypadku zgłoszenia przez osobę trzecią roszczeń dotyczących przekazanych materiałów Użytkownik zobowiązuje się niezwłocznie poinformować o tym Platformę eMemories.pl oraz współpracować z nią w celu wyjaśnienia sprawy.",
      "Jeżeli okaże się, że określony materiał został przekazany bez wymaganej podstawy prawnej, Użytkownik zobowiązuje się niezwłocznie podjąć działania w celu wyjaśnienia sprawy oraz, w razie potrzeby, jego usunięcia lub ograniczenia jego dostępności.",
    ],
  },
  {
    title: "7. Obowiązek zachowania dokumentacji",
    paragraphs: [
      "Użytkownik zobowiązuje się przechowywać przez okres obowiązywania współpracy z Platformą eMemories.pl, a następnie przez okres wymagany przepisami prawa, informacje lub dokumenty potwierdzające podstawę przekazania materiałów przez osobę uprawnioną, w zakresie wymaganym przez obowiązujące przepisy prawa.",
      "Na uzasadnione żądanie Platformy eMemories.pl Użytkownik zobowiązuje się potwierdzić, że posiada odpowiednią podstawę do przekazania określonych materiałów.",
    ],
  },
  {
    title: "8. Dane Osoby Zmarłej",
    paragraphs: [
      "Użytkownik przyjmuje do wiadomości, że materiały dotyczące Osoby Zmarłej mogą zawierać również informacje dotyczące osób żyjących, w szczególności członków rodziny, osób bliskich, autorów wspomnień lub osób przedstawionych na fotografiach.",
      "Użytkownik zobowiązuje się do zachowania szczególnej staranności w zakresie materiałów zawierających dane lub wizerunek osób żyjących oraz do przekazywania ich wyłącznie w zakresie zgodnym z posiadanymi uprawnieniami.",
    ],
  },
  {
    title: "9. Zgodność z Regulaminem Platformy",
    paragraphs: [
      "Użytkownik oświadcza, że przekazuje materiały zgodnie z Regulaminem Platformy eMemories.pl oraz zobowiązuje się stosować do zasad dotyczących ich pozyskiwania, przekazywania, publikacji, przechowywania, aktualizacji i usuwania.",
    ],
  },
]

/** Replaces the paper form's identification and signature blocks. */
export const DECLARATION_ELECTRONIC_NOTE =
  "Oświadczenie składane jest w Platformie eMemories.pl w postaci elektronicznej. Dane Użytkownika — nazwa zakładu pogrzebowego, NIP i adres — pochodzą z konta, na którym złożono oświadczenie. Platforma odnotowuje konto składające oświadczenie, datę i godzinę złożenia oraz wersję dokumentu."
