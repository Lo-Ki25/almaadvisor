"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, BookOpen, Shield, Zap, Users, Target, BarChart3, Lock, Globe } from "lucide-react"

const methodologies = [
  {
    id: "togaf",
    name: "TOGAF",
    category: "Architecture",
    description: "Framework d'architecture d'entreprise pour la transformation digitale",
    icon: Target,
    color: "bg-blue-100 text-blue-800",
    tags: ["Architecture", "Enterprise", "Framework"],
    details: "The Open Group Architecture Framework (TOGAF) est un cadre méthodologique pour l'architecture d'entreprise qui fournit une approche pour concevoir, planifier, mettre en œuvre et gouverner une architecture d'information d'entreprise."
  },
  {
    id: "zachman",
    name: "Zachman Framework",
    category: "Architecture",
    description: "Cadre de référence pour l'architecture d'entreprise",
    icon: BarChart3,
    color: "bg-green-100 text-green-800",
    tags: ["Architecture", "Enterprise", "Modélisation"],
    details: "Le Framework Zachman est un schéma de classification logique et structurée pour décrire et organiser les représentations descriptives d'une entreprise significatives pour la gestion de l'entreprise et le développement des systèmes d'entreprise."
  },
  {
    id: "c4-model",
    name: "C4 Model",
    category: "Architecture",
    description: "Modélisation d'architecture logicielle en 4 niveaux",
    icon: Target,
    color: "bg-purple-100 text-purple-800",
    tags: ["Architecture", "Software", "Diagrammes"],
    details: "Le modèle C4 est une approche de modélisation de l'architecture logicielle basée sur l'abstraction et la décomposition structurelle, utilisant un ensemble de diagrammes hiérarchiques : Contexte, Conteneurs, Composants et Code."
  },
  {
    id: "bpmn",
    name: "BPMN 2.0",
    category: "Processus",
    description: "Notation pour la modélisation des processus métier",
    icon: Zap,
    color: "bg-orange-100 text-orange-800",
    tags: ["Processus", "Modélisation", "Workflow"],
    details: "Business Process Model and Notation (BPMN) est une notation graphique standardisée pour modéliser les processus métier dans un workflow. BPMN 2.0 est la version actuelle qui inclut des éléments d'exécution."
  },
  {
    id: "itil",
    name: "ITIL 4",
    category: "Gouvernance",
    description: "Framework de gestion des services IT",
    icon: Users,
    color: "bg-cyan-100 text-cyan-800",
    tags: ["ITSM", "Services", "Gouvernance"],
    details: "ITIL (Information Technology Infrastructure Library) version 4 est un ensemble de bonnes pratiques pour la gestion des services informatiques (ITSM) qui se concentre sur l'alignement des services IT avec les besoins de l'entreprise."
  },
  {
    id: "cobit",
    name: "COBIT 2019",
    category: "Gouvernance",
    description: "Cadre de gouvernance et de gestion IT",
    icon: Shield,
    color: "bg-indigo-100 text-indigo-800",
    tags: ["Gouvernance", "Risk", "Compliance"],
    details: "COBIT (Control Objectives for Information and Related Technologies) 2019 est un cadre de gouvernance et de gestion pour les technologies de l'information d'entreprise."
  },
  {
    id: "owasp",
    name: "OWASP",
    category: "Sécurité",
    description: "Standards de sécurité applicative",
    icon: Lock,
    color: "bg-red-100 text-red-800",
    tags: ["Sécurité", "Web", "Applications"],
    details: "Open Web Application Security Project (OWASP) est une organisation à but non lucratif qui se concentre sur l'amélioration de la sécurité des logiciels, notamment avec le Top 10 des vulnérabilités web."
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    category: "Sécurité",
    description: "Norme de sécurité de l'information",
    icon: Shield,
    color: "bg-gray-100 text-gray-800",
    tags: ["ISO", "Sécurité", "Certification"],
    details: "ISO/IEC 27001 est une norme internationale de sécurité de l'information qui spécifie les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un système de gestion de la sécurité de l'information."
  },
  {
    id: "rgpd",
    name: "RGPD",
    category: "Conformité",
    description: "Règlement européen sur la protection des données",
    icon: Globe,
    color: "bg-blue-100 text-blue-800",
    tags: ["GDPR", "Privacy", "Conformité"],
    details: "Le Règlement Général sur la Protection des Données (RGPD) est un règlement de l'Union européenne qui constitue le texte de référence en matière de protection des données à caractère personnel."
  },
  {
    id: "loi-09-08",
    name: "Loi 09-08",
    category: "Conformité",
    description: "Loi marocaine sur la protection des données personnelles",
    icon: Shield,
    color: "bg-green-100 text-green-800",
    tags: ["Maroc", "Privacy", "Données"],
    details: "La loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel au Maroc."
  }
]

const categories = ["Tous", "Architecture", "Processus", "Gouvernance", "Sécurité", "Conformité"]

export default function MethodologiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")

  const filteredMethodologies = methodologies.filter((methodology) => {
    const matchesSearch = 
      methodology.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      methodology.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      methodology.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "Tous" || methodology.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Méthodologies & Frameworks</h1>
        <p className="text-muted-foreground">
          Explorez les méthodologies et frameworks disponibles pour vos projets de transformation digitale
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une méthodologie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMethodologies.map((methodology) => {
          const Icon = methodology.icon
          return (
            <Card key={methodology.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${methodology.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{methodology.name}</CardTitle>
                    <CardDescription>{methodology.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {methodology.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {methodology.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {methodology.details}
                  </p>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMethodologies.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune méthodologie trouvée</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou de filtrage
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Répartition des méthodologies par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.slice(1).map((category) => {
              const count = methodologies.filter(m => m.category === category).length
              return (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground">{category}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}