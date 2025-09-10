"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  FileText, 
  Info, 
  BookOpen, 
  Zap,
  FileImage,
  Code2,
  Sparkles
} from 'lucide-react'
import { MermaidEditor } from '@/components/mermaid/mermaid-editor'
import { DiagramLibrary } from '@/components/diagram-library'
import { diagramTemplates, getAllCategories } from '@/lib/mermaid-templates'

interface Diagram {
  id: string
  name: string
  type: string
  category: string
  mermaidCode: string
  createdAt: Date
  updatedAt: Date
}

export default function DiagrammesPage() {
  const [activeTab, setActiveTab] = useState<string>('editor')
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null)

  // Gérer la sélection d'un diagramme depuis la bibliothèque
  const handleSelectDiagram = (diagram: Diagram) => {
    setSelectedDiagram(diagram)
    setActiveTab('editor')
  }

  // Gérer la création d'un nouveau diagramme
  const handleCreateDiagram = (diagramData: Omit<Diagram, "id" | "createdAt" | "updatedAt">) => {
    console.log('Nouveau diagramme créé:', diagramData)
    // Ici, vous pourriez sauvegarder dans une base de données
    setActiveTab('library')
  }

  // Statistiques des templates
  const templateStats = {
    total: diagramTemplates.length,
    categories: getAllCategories().length,
    mostPopular: 'C4 - Diagramme de Contexte'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* En-tête */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Palette className="h-8 w-8 text-blue-600" />
                Éditeur de Diagrammes
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Créez, éditez et exportez des diagrammes professionnels avec Mermaid
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <FileImage className="h-3 w-3" />
                  {templateStats.total} templates
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {templateStats.categories} catégories
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Informations importantes */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Aucune authentification requise.</strong> Cet éditeur est accessible publiquement. 
            Vos diagrammes sont traités côté client pour votre confidentialité.
          </AlertDescription>
        </Alert>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="editor" className="gap-2">
              <Code2 className="h-4 w-4" />
              Éditeur
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <FileText className="h-4 w-4" />
              Bibliothèque
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Guide
            </TabsTrigger>
          </TabsList>

          {/* Onglet Éditeur */}
          <TabsContent value="editor" className="space-y-6">
            <MermaidEditor
              initialCode={selectedDiagram?.mermaidCode || ''}
              initialDiagramType={selectedDiagram?.type || 'c4-context'}
              onSave={(code, diagramType) => {
                console.log('Diagramme sauvegardé:', { code, diagramType })
                // Ici vous pourriez implémenter la sauvegarde
              }}
              maxCharacters={10000}
            />
          </TabsContent>

          {/* Onglet Bibliothèque */}
          <TabsContent value="library" className="space-y-6">
            <DiagramLibrary
              onSelectDiagram={handleSelectDiagram}
              onCreateDiagram={handleCreateDiagram}
            />
          </TabsContent>

          {/* Onglet Guide */}
          <TabsContent value="guide" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Guide rapide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Guide Rapide
                  </CardTitle>
                  <CardDescription>
                    Commencez rapidement avec l'éditeur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Choisissez un template</p>
                        <p className="text-sm text-muted-foreground">
                          Sélectionnez un modèle prêt à l'emploi dans l'éditeur
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Modifiez le code</p>
                        <p className="text-sm text-muted-foreground">
                          Éditez le code Mermaid dans la vue split
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Preview en temps réel</p>
                        <p className="text-sm text-muted-foreground">
                          Visualisez les changements instantanément
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Exportez</p>
                        <p className="text-sm text-muted-foreground">
                          Téléchargez en SVG ou PNG haute qualité
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Types de diagrammes supportés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-green-600" />
                    Types de Diagrammes
                  </CardTitle>
                  <CardDescription>
                    Diagrammes professionnels disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getAllCategories().map((category) => {
                      const categoryTemplates = diagramTemplates.filter(t => t.category === category)
                      return (
                        <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{category}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryTemplates.map(t => t.name).join(', ')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {categoryTemplates.length}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Fonctionnalités */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Fonctionnalités Avancées
                  </CardTitle>
                  <CardDescription>
                    Tout ce dont vous avez besoin pour créer des diagrammes professionnels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">🎨 Templates Prêts</h4>
                      <p className="text-sm text-muted-foreground">
                        C4, BPMN, Gantt, STRIDE, Business Canvas
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">⚡ Preview Temps Réel</h4>
                      <p className="text-sm text-muted-foreground">
                        Debounced 300ms pour une expérience fluide
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">📊 Export Multi-Format</h4>
                      <p className="text-sm text-muted-foreground">
                        SVG vectoriel et PNG haute résolution
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">🛡️ Gestion d'Erreurs</h4>
                      <p className="text-sm text-muted-foreground">
                        Messages d'erreur clairs et détaillés
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">🖥️ Split View</h4>
                      <p className="text-sm text-muted-foreground">
                        Code, Preview, ou vue combinée
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">🔒 Confidentialité</h4>
                      <p className="text-sm text-muted-foreground">
                        Traitement 100% côté client
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
