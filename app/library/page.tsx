"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink,
  Star,
  Calendar,
  Tag,
  Users,
  Globe
} from "lucide-react"

const resources = [
  {
    id: "togaf-guide",
    title: "Guide TOGAF 9.2",
    type: "Guide",
    category: "Architecture",
    description: "Guide complet pour l'implémentation du framework TOGAF dans les projets d'architecture d'entreprise",
    author: "The Open Group",
    date: "2024-01-15",
    rating: 4.8,
    downloads: 1250,
    tags: ["TOGAF", "Architecture", "Enterprise"],
    url: "#",
    featured: true
  },
  {
    id: "bpmn-template",
    title: "Templates BPMN 2.0",
    type: "Template",
    category: "Processus",
    description: "Collection de templates BPMN pour modéliser rapidement vos processus métier",
    author: "ALMA Team",
    date: "2024-02-01",
    rating: 4.6,
    downloads: 890,
    tags: ["BPMN", "Processus", "Templates"],
    url: "#",
    featured: false
  },
  {
    id: "security-checklist",
    title: "Checklist Sécurité OWASP",
    type: "Checklist",
    category: "Sécurité",
    description: "Checklist complète basée sur les recommandations OWASP pour auditer la sécurité applicative",
    author: "Security Team",
    date: "2024-01-20",
    rating: 4.9,
    downloads: 2100,
    tags: ["OWASP", "Sécurité", "Audit"],
    url: "#",
    featured: true
  },
  {
    id: "c4-examples",
    title: "Exemples de Diagrammes C4",
    type: "Exemples",
    category: "Architecture",
    description: "Exemples pratiques de diagrammes C4 pour différents types d'architectures logicielles",
    author: "Architecture Team",
    date: "2024-02-10",
    rating: 4.7,
    downloads: 650,
    tags: ["C4", "Architecture", "Diagrammes"],
    url: "#",
    featured: false
  },
  {
    id: "rgpd-compliance",
    title: "Kit de Conformité RGPD",
    type: "Kit",
    category: "Conformité",
    description: "Ensemble complet de documents et procédures pour assurer la conformité RGPD",
    author: "Legal Team",
    date: "2024-01-30",
    rating: 4.5,
    downloads: 1800,
    tags: ["RGPD", "Conformité", "Privacy"],
    url: "#",
    featured: true
  },
  {
    id: "risk-assessment",
    title: "Matrice d'Évaluation des Risques",
    type: "Outil",
    category: "Gouvernance",
    description: "Outil Excel pour évaluer et prioriser les risques dans vos projets de transformation",
    author: "Risk Management",
    date: "2024-02-05",
    rating: 4.4,
    downloads: 720,
    tags: ["Risques", "Évaluation", "Excel"],
    url: "#",
    featured: false
  }
]

const categories = ["Tous", "Architecture", "Processus", "Sécurité", "Conformité", "Gouvernance"]
const types = ["Tous", "Guide", "Template", "Checklist", "Exemples", "Kit", "Outil"]

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [selectedType, setSelectedType] = useState("Tous")

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "Tous" || resource.category === selectedCategory
    const matchesType = selectedType === "Tous" || resource.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const featuredResources = resources.filter(resource => resource.featured)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bibliothèque de Ressources</h1>
        <p className="text-muted-foreground">
          Accédez à une collection complète de guides, templates et outils pour vos projets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{resources.length}</div>
                <div className="text-sm text-muted-foreground">Ressources</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {resources.reduce((acc, r) => acc + r.downloads, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Téléchargements</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {(resources.reduce((acc, r) => acc + r.rating, 0) / resources.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{featuredResources.length}</div>
                <div className="text-sm text-muted-foreground">Ressources vedettes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la bibliothèque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Catégorie:</span>
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
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes les ressources</TabsTrigger>
          <TabsTrigger value="featured">Ressources vedettes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          {resource.featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Vedette
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {resource.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {resource.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(resource.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">{resource.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{resource.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>{resource.downloads.toLocaleString()} téléchargements</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune ressource trouvée</h3>
                  <p className="text-muted-foreground">
                    Essayez de modifier vos critères de recherche ou de filtrage
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow border-yellow-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {resource.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {resource.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(resource.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>{resource.downloads.toLocaleString()} téléchargements</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}