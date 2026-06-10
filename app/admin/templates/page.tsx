import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"

const templates = [
  {
    id: "1",
    name: "Klasyczny — prosty",
    description: "Minimalistyczny układ z portretem, datami i treścią nekrologu",
    status: "active",
    usedBy: 3,
  },
  {
    id: "2",
    name: "Elegancki — ramka",
    description: "Delikatna ozdobna ramka, pismo szeryfowe, klasyczny wygląd",
    status: "active",
    usedBy: 1,
  },
  {
    id: "3",
    name: "Nowoczesny — jasny",
    description: "Duże zdjęcie, duże litery, minimalistyczne tło",
    status: "draft",
    usedBy: 0,
  },
]

export default function TemplatesPage() {
  return (
    <>
      <Topbar title="Szablony" subtitle="Zarządzaj szablonami nekrologów" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{templates.length} szablony dostępne</p>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nowy szablon
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="group cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant={tpl.status === "active" ? "success" : "outline"}>
                    {tpl.status === "active" ? "Aktywny" : "Szkic"}
                  </Badge>
                </div>
                <CardTitle className="text-sm mt-2">{tpl.name}</CardTitle>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Używany przez {tpl.usedBy} {tpl.usedBy === 1 ? "klienta" : "klientów"}
                  </p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Edytuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
