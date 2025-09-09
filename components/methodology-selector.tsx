"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Workflow, Shield, Target, BarChart3, AlertTriangle, Cog, TrendingUp } from "lucide-react"

interface MethodologySelectorProps {
  onSelectMethodology: (methodology: string) => void
  applicableMethodologies?: string[]
}

export function MethodologySelector({ onSelectMethodology, applicableMethodologies }: MethodologySelectorProps) {
  const methodologies = [
    {
      id: "TOGAF",
      name: "TOGAF",
      description: "The Open Group Architecture Framework pour l'architecture d'entreprise",
      category: "Architecture",
      icon: Building2,
      color: "bg-blue-500",
      sections: ["Architecture Cible", "Gouvernance"],
      complexity: "Élevée",
      duration: "2-4 semaines",
    },
    {
      id: "C4 Model",
      name: "C4 Model",
      description: "Modélisation d'architecture logicielle en 4 niveaux",
      category: "Architecture",
      icon: Workflow,
      color: "bg-green-500",
      sections: ["Architecture Cible", "Modélisation des Processus"],
      complexity: "Moyenne",
      duration: "1-2 semaines",
    },
    {
      id: "Business Model Canvas",
      name: "Business Model Canvas",
      description: "Outil de modélisation stratégique pour les modèles d'affaires",
      category: "Stratégie",
      icon: Target,
      color: "bg-purple-500",
      sections: ["Vision et Positionnement", "Business Model Canvas"],
      complexity: "Faible",
      duration: "3-5 jours",
    },
    {
      id: "RICE",
      name: "RICE Prioritization",
      description: "Framework de priorisation basé sur Reach, Impact, Confidence, Effort",
      category: "Priorisation",
      icon: BarChart3,
      color: "bg-orange-500",
      sections: ["Roadmap et Priorisation"],
      complexity: "Faible",
      duration: "1-2 jours",
    },
    {
      id: "GDPR Compliance",
      name: "GDPR Compliance",
      description: "Évaluation de conformité au Règlement Général sur la Protection des Données",
      category: "Conformité",
      icon: Shield,
      color: "bg-red-500",
      sections: ["Sécurité et Conformité"],
      complexity: "Élevée",
      duration: "1-3 semaines",
    },
    {
      id: "ITIL 4",
      name: "ITIL 4",
      description: "Framework de gestion des services IT et gouvernance",
      category: "Gouvernance",
      icon: Cog,
      color: "bg-indigo-500",
      sections: ["Gouvernance et Organisation", "KPIs et Métriques"],
      complexity: "Élevée",
      duration: "2-4 semaines",
    },
    {
      id: "OWASP",
      name: "OWASP Security",
      description: "Framework de sécurité applicative et évaluation des risques",
      category: "Sécurité",
      icon: AlertTriangle,
      color: "bg-yellow-500",
      sections: ["Sécurité et Conformité", "Analyse des Risques"],
      complexity: "Moyenne",
      duration: "1-2 semaines",
    },
    {
      id: "FinOps",
      name: "FinOps",
      description: "Méthodologie de gestion financière cloud et optimisation des coûts",
      category: "Finance",
      icon: TrendingUp,
      color: "bg-emerald-500",
      sections: ["Budget et Analyse Financière"],
      complexity: "Moyenne",
      duration: "1-2 semaines",
    },
  ]

  const categories = [...new Set(methodologies.map((m) => m.category))]

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Faible":
        return "bg-green-100 text-green-800"
      case "Moyenne":
        return "bg-yellow-100 text-yellow-800"
      case "Élevée":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Sélectionnez une Méthodologie</h2>
        <p className="text-muted-foreground">Choisissez la méthodologie appropriée pour structurer votre analyse</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{category}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methodologies
              .filter((m) => m.category === category)
              .filter((m) => !applicableMethodologies || applicableMethodologies.includes(m.id))
              .map((methodology) => {
                const IconComponent = methodology.icon
                return (
                  <Card
                    key={methodology.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => onSelectMethodology(methodology.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${methodology.color} group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{methodology.name}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {methodology.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <CardDescription className="text-sm leading-relaxed">{methodology.description}</CardDescription>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Complexité:</span>
                          <Badge className={`text-xs ${getComplexityColor(methodology.complexity)}`}>
                            {methodology.complexity}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Durée:</span>
                          <span className="font-medium">{methodology.duration}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Sections applicables:</p>
                        <div className="flex flex-wrap gap-1">
                          {methodology.sections.map((section) => (
                            <Badge key={section} variant="secondary" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full mt-3" size="sm">
                        Utiliser cette méthodologie
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
