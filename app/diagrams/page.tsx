"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  GitBranch, 
  Calendar, 
  Shield, 
  Layers, 
  Network,
  Eye,
  Download,
  Code
} from "lucide-react"

const diagramTypes = [
  {
    id: "c4-context",
    name: "C4 Context",
    category: "Architecture",
    description: "Vue d'ensemble du système dans son contexte",
    icon: Network,
    color: "bg-blue-100 text-blue-800",
    example: `graph TB
    User[👤 Utilisateur]
    System[🏢 Système ALMA]
    ExtDB[(🗄️ Base de données externe)]
    ExtAPI[🔌 APIs externes]
    
    User -->|Utilise| System
    System -->|Lit/Écrit| ExtDB
    System -->|Intègre| ExtAPI`
  },
  {
    id: "c4-container",
    name: "C4 Container",
    category: "Architecture",
    description: "Architecture des conteneurs applicatifs",
    icon: Layers,
    color: "bg-green-100 text-green-800",
    example: `graph TB
    subgraph "Frontend"
        WebApp[📱 Application Web]
        MobileApp[📱 App Mobile]
    end
    
    subgraph "Backend"
        API[🔌 API Gateway]
        AuthService[🔐 Service Auth]
        BusinessLogic[⚙️ Logique Métier]
    end
    
    WebApp --> API
    MobileApp --> API
    API --> AuthService
    API --> BusinessLogic`
  },
  {
    id: "bpmn",
    name: "BPMN",
    category: "Processus",
    description: "Modélisation des processus métier",
    icon: GitBranch,
    color: "bg-orange-100 text-orange-800",
    example: `graph LR
    Start([🚀 Début])
    UserRequest[📝 Demande]
    Validation{✅ Validation}
    Processing[⚙️ Traitement]
    End([✅ Fin])
    
    Start --> UserRequest
    UserRequest --> Validation
    Validation -->|Valide| Processing
    Validation -->|Invalide| UserRequest
    Processing --> End`
  },
  {
    id: "gantt",
    name: "Gantt",
    category: "Planning",
    description: "Planification de projet",
    icon: Calendar,
    color: "bg-purple-100 text-purple-800",
    example: `gantt
    title Planning Projet
    dateFormat  YYYY-MM-DD
    section Phase 1
    Analyse           :done, 2024-01-01, 2024-02-15
    Architecture      :active, 2024-02-01, 2024-03-01
    section Phase 2
    Développement     :2024-03-01, 2024-05-01
    Tests             :2024-04-15, 2024-05-15`
  },
  {
    id: "stride",
    name: "STRIDE",
    category: "Sécurité",
    description: "Analyse des menaces de sécurité",
    icon: Shield,
    color: "bg-red-100 text-red-800",
    example: `graph TB
    subgraph "Menaces STRIDE"
        S[🎭 Spoofing]
        T[🔄 Tampering]
        R[🚫 Repudiation]
        I[👁️ Information Disclosure]
        D[💥 Denial of Service]
        E[⬆️ Elevation of Privilege]
    end
    
    subgraph "Mitigations"
        Auth[🔐 Authentification]
        Integrity[🔒 Intégrité]
        Logging[📝 Journalisation]
    end
    
    S --> Auth
    T --> Integrity
    R --> Logging`
  }
]

const categories = ["Tous", "Architecture", "Processus", "Planning", "Sécurité"]

export default function DiagramsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Générateur de Diagrammes</h1>
        <p className="text-muted-foreground">
          Créez automatiquement des diagrammes professionnels avec Mermaid.js
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{diagramTypes.length}</div>
                <div className="text-sm text-muted-foreground">Types de diagrammes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Code className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">Mermaid.js</div>
                <div className="text-sm text-muted-foreground">Moteur de rendu</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">SVG/PNG</div>
                <div className="text-sm text-muted-foreground">Export disponible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagram Types */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {categories.slice(1).map(category => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {diagramTypes.map((diagram) => {
              const Icon = diagram.icon
              return (
                <Card key={diagram.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${diagram.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{diagram.name}</CardTitle>
                          <CardDescription>{diagram.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{diagram.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto text-muted-foreground">
                        {diagram.example}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Code className="h-4 w-4 mr-2" />
                        Éditer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {categories.slice(1).map(category => (
          <TabsContent key={category} value={category.toLowerCase()} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {diagramTypes
                .filter(diagram => diagram.category === category)
                .map((diagram) => {
                  const Icon = diagram.icon
                  return (
                    <Card key={diagram.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${diagram.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{diagram.name}</CardTitle>
                            <CardDescription>{diagram.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-xs overflow-x-auto text-muted-foreground">
                            {diagram.example}
                          </pre>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Prévisualiser
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Code className="h-4 w-4 mr-2" />
                            Éditer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça fonctionne</CardTitle>
          <CardDescription>Les diagrammes sont générés automatiquement lors de la création de rapports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium">Création automatique</h4>
                <p className="text-sm text-muted-foreground">
                  Les diagrammes sont générés automatiquement basés sur vos données de projet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium">Rendu Mermaid</h4>
                <p className="text-sm text-muted-foreground">
                  Utilisation de Mermaid.js pour un rendu professionnel et interactif
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium">Export multiple</h4>
                <p className="text-sm text-muted-foreground">
                  Exportez en SVG, PNG ou intégrez directement dans vos rapports
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}