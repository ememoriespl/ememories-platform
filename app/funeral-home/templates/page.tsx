import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle } from "lucide-react"

const templates = [
  {
    id: "1",
    name: "Klasyczny — prosty",
    description: "Minimalistyczny układ z portretem, datami i treścią nekrologu",
    active: true,
  },
  {
    id: "2",
    name: "Elegancki — ramka",
    description: "Delikatna ozdobna ramka, pismo szeryfowe, klasyczny wygląd",
    active: false,
  },
]

export default function FhTemplatesPage() {
  return (
    <>
      <Topbar title="Szablony" subtitle="Wybierz szablon dla swoich nekrologów" />

      <div className="p-6 space-y-4 max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Szablon jest stosowany do wszystkich nowych nekrologów. Możesz go zmienić w dowolnym momencie.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className={`cursor-pointer transition-all ${
                tpl.active
                  ? "ring-2 ring-foreground"
                  : "hover:ring-2 hover:ring-foreground/20"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {tpl.active && (
                    <Badge className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Aktywny
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm mt-2">{tpl.name}</CardTitle>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {!tpl.active && (
                  <Button variant="outline" size="sm" className="w-full">
                    Wybierz ten szablon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
