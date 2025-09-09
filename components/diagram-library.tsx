"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, Eye, Edit, Trash2, Copy } from "lucide-react"
import { DiagramGenerator } from "./diagram-generator"

interface Diagram {
  id: string
  name: string
  type: string
  category: string
  mermaidCode: string
  createdAt: Date
  updatedAt: Date
}

interface DiagramLibraryProps {
  onSelectDiagram?: (diagram: Diagram) => void
  onCreateDiagram?: (diagram: Omit<Diagram, "id" | "createdAt" | "updatedAt">) => void
}

export function DiagramLibrary({ onSelectDiagram, onCreateDiagram }: DiagramLibraryProps) {
  const [diagrams, setDiagrams] = useState<Diagram[]>([
    {
      id: "1",
      name: "Architecture Système Principal",
      type: "c4-context",
      category: "Architecture",
      mermaidCode: `graph TB
    User[👤 Utilisateur Final] --> System[🏢 Système Principal]
    System --> Database[🗄️ Base de Données]
    System --> API[🔌 API Externe]`,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: "2",
      name: "Processus de Validation",
      type: "bpmn-process",
      category: "Process",
      mermaidCode: `graph TD
    Start([Début]) --> Review[Révision]
    Review --> Decision{Approuvé?}
    Decision -->|Oui| Approve[Approuver]
    Decision -->|Non| Reject[Rejeter]`,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18"),
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)
  const [editingDiagram, setEditingDiagram] = useState<Diagram | null>(null)

  const categories = ["all", ...new Set(diagrams.map((d) => d.category))]

  const filteredDiagrams = diagrams.filter((diagram) => {
    const matchesSearch =
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagram.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || diagram.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateDiagram = (mermaidCode: string, diagramType: string) => {
    const newDiagram = {
      name: `Nouveau Diagramme ${diagramType}`,
      type: diagramType,
      category: getCategoryFromType(diagramType),
      mermaidCode,
    }

    const diagram: Diagram = {
      ...newDiagram,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setDiagrams((prev) => [...prev, diagram])
    onCreateDiagram?.(newDiagram)
    setIsCreating(false)
  }

  const handleUpdateDiagram = (mermaidCode: string, diagramType: string) => {
    if (!editingDiagram) return

    const updatedDiagram = {
      ...editingDiagram,
      type: diagramType,
      mermaidCode,
      updatedAt: new Date(),
    }

    setDiagrams((prev) => prev.map((d) => (d.id === editingDiagram.id ? updatedDiagram : d)))
    setEditingDiagram(null)
  }

  const handleDeleteDiagram = (id: string) => {
    setDiagrams((prev) => prev.filter((d) => d.id !== id))
  }

  const handleDuplicateDiagram = (diagram: Diagram) => {
    const duplicated: Diagram = {
      ...diagram,
      id: Date.now().toString(),
      name: `${diagram.name} (Copie)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setDiagrams((prev) => [...prev, duplicated])
  }

  const getCategoryFromType = (type: string): string => {
    if (type.startsWith("c4-") || type === "togaf-adm") return "Architecture"
    if (type === "bpmn-process") return "Process"
    if (type === "business-canvas") return "Strategy"
    if (type === "risk-matrix") return "Risk"
    if (type === "roadmap") return "Planning"
    if (type === "organizational") return "Organization"
    return "Other"
  }

  const getTypeDisplayName = (type: string): string => {
    const typeNames: Record<string, string> = {
      "c4-context": "C4 - Contexte",
      "c4-container": "C4 - Conteneurs",
      "bpmn-process": "BPMN 2.0",
      "business-canvas": "Business Canvas",
      "togaf-adm": "TOGAF ADM",
      "risk-matrix": "Matrice de Risques",
      roadmap: "Roadmap",
      organizational: "Organigramme",
    }
    return typeNames[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bibliothèque de Diagrammes</h2>
          <p className="text-muted-foreground">Gérez vos diagrammes pour les rapports ALMA-ADVISOR</p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Diagramme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Diagramme</DialogTitle>
              <DialogDescription>
                Utilisez le générateur pour créer un nouveau diagramme professionnel
              </DialogDescription>
            </DialogHeader>
            <DiagramGenerator onSave={handleCreateDiagram} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des diagrammes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "Tous" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Diagrams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDiagrams.map((diagram) => (
          <Card key={diagram.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">{diagram.name}</CardTitle>
                  <CardDescription className="text-sm">{getTypeDisplayName(diagram.type)}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {diagram.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="bg-muted/30 rounded p-2 text-xs font-mono text-muted-foreground line-clamp-3">
                {diagram.mermaidCode}
              </div>

              <div className="text-xs text-muted-foreground">
                Modifié le {diagram.updatedAt.toLocaleDateString("fr-FR")}
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => onSelectDiagram?.(diagram)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Voir
                </Button>

                <Button size="sm" variant="outline" onClick={() => setEditingDiagram(diagram)}>
                  <Edit className="h-3 w-3" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => handleDuplicateDiagram(diagram)}>
                  <Copy className="h-3 w-3" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => handleDeleteDiagram(diagram.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiagrams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun diagramme trouvé</p>
          <Button className="mt-4" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer votre premier diagramme
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDiagram} onOpenChange={() => setEditingDiagram(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Diagramme</DialogTitle>
            <DialogDescription>Modifiez votre diagramme existant</DialogDescription>
          </DialogHeader>
          {editingDiagram && <DiagramGenerator initialType={editingDiagram.type} onSave={handleUpdateDiagram} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
