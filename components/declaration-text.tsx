import {
  DECLARATION_ELECTRONIC_NOTE,
  DECLARATION_INTRO,
  DECLARATION_SECTIONS,
} from "@/lib/declaration"

/** The declaration body, shared by the public page and the acceptance dialog. */
export function DeclarationText() {
  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <p>{DECLARATION_INTRO}</p>

      {DECLARATION_SECTIONS.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="font-semibold text-foreground">{section.title}</h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="text-muted-foreground">
              {p}
            </p>
          ))}
          {section.items && (
            <ul className="space-y-1 pl-4 text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.after?.map((p) => (
            <p key={p} className="text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}

      <p className="rounded-xl border bg-muted/30 p-4 text-muted-foreground">
        {DECLARATION_ELECTRONIC_NOTE}
      </p>
    </div>
  )
}
