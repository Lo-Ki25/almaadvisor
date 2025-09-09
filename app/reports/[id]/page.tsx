"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Eye, Settings, Brain, Upload, FileOutput, Database, Quote, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface ReportPageProps {
  params: {
    id: string
  }
}

interface Project {
  id: string
  title: string
  client?: string
  lead?: string
  language: string
  committee?: string
  style?: string
  status: string
  methodologies?: string[]
  ragOptions?: {
    chunkSize?: number
    overlap?: number
    topK?: number
  }
  createdAt: string
  updatedAt: string
  documents: Array<{
    id: string
    name: string
    mime: string
    pages?: number
    size?: number
    status: string
    createdAt: string
  }>
  chunks: Array<{
    id: string
    text: string
    page: number
    document: {
      name: string
    }
  }>
  citations: Array<{
    id: string
    snippet: string
    section: string
    page: number
    document: {
      name: string
    }
  }>
  diagrams: Array<{
    id: string
    kind: string
    title: string
    mermaid: string
    createdAt: string
  }>
  tables: Array<{
    id: string
    name: string
    csv: string
    createdAt: string
  }>
  report?: {
    id: string
    markdown: string
    pdfPath?: string
    createdAt: string
    updatedAt: string
  }
}

export default function ReportPage({ params }: ReportPageProps) {
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [params.id]) // Include params.id as dependency

  const fetchProject = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
    
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast({
          title: "Erreur",
          description: "Projet non trouvé",
          variant: "destructive",
        })
      }
    } catch (error) {
      clearTimeout(timeoutId)
      let errorMessage = "Impossible de charger le projet"
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = "Délai d'attente dépassé. Veuillez réessayer."
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProcessStep = async (step: string) => {
    if (!project) return

    setProcessing(true)
    try {
      let endpoint = ""
      switch (step) {
        case "ingest":
          endpoint = `/api/projects/${project.id}/ingest`
          break
        case "embed":
          endpoint = `/api/projects/${project.id}/embed`
          break
        case "generate":
          endpoint = `/api/projects/${project.id}/generate`
          break
        default:
          return
      }

      const response = await fetch(endpoint, { method: "POST" })
      if (response.ok) {
        toast({
          title: "Succès",
          description: `Étape ${step} terminée avec succès`,
        })
        await fetchProject() // Refresh project data
      } else {
        throw new Error(`Failed to ${step}`)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible d'exécuter l'étape ${step}`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
      case "exported":
        return "bg-green-100 text-green-800"
      case "generating":
      case "embedded":
        return "bg-blue-100 text-blue-800"
      case "uploading":
      case "ingested":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Brouillon",
      uploading: "Upload en cours",
      ingested: "Documents traités",
      embedded: "Analyse terminée",
      generating: "Génération en cours",
      generated: "Rapport généré",
      exported: "Exporté",
      error: "Erreur",
    }
    return labels[status] || status
  }

  const getProgressPercentage = (status: string) => {
    const statusProgress: Record<string, number> = {
      draft: 10,
      uploading: 25,
      ingested: 50,
      embedded: 75,
      generating: 90,
      generated: 100,
      exported: 100,
      error: 0,
    }
    return statusProgress[status] || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Projet non trouvé</h2>
        <p className="text-muted-foreground mb-4">Le projet demandé n'existe pas ou a été supprimé.</p>
        <Link href="/reports">
          <Button>Retour aux projets</Button>
        </Link>
      </div>
    )
  }

  const methodologies = Array.isArray(project.methodologies) ? project.methodologies : []
  const ragOptions = typeof project.ragOptions === 'object' ? project.ragOptions : {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
          </div>
          <p className="text-muted-foreground">
            {project.client} • {project.lead || "Consultant non assigné"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {project.report && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          )}
          <Link href="/reports">
            <Button variant="outline">Retour</Button>
          </Link>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Pipeline RAG - Progression
          </CardTitle>
          <CardDescription>Statut actuel du traitement documentaire et de la génération</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={getProgressPercentage(project.status)} className="flex-1" />
              <span className="text-sm font-medium">{getProgressPercentage(project.status)}%</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Upload className={`h-6 w-6 ${project.documents.length > 0 ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-sm text-muted-foreground">{project.documents.length} fichiers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Database className={`h-6 w-6 ${project.chunks.length > 0 ? "text-blue-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">Chunks</p>
                  <p className="text-sm text-muted-foreground">{project.chunks.length} segments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Brain
                  className={`h-6 w-6 ${["embedded", "generating", "generated"].includes(project.status) ? "text-purple-600" : "text-gray-400"}`}
                />
                <div>
                  <p className="font-medium">Embeddings</p>
                  <p className="text-sm text-muted-foreground">
                    {["embedded", "generating", "generated"].includes(project.status) ? "Terminé" : "En attente"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileOutput className={`h-6 w-6 ${project.report ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">Rapport</p>
                  <p className="text-sm text-muted-foreground">{project.report ? "Généré" : "En attente"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {project.status === "uploading" && (
                <Button onClick={() => handleProcessStep("ingest")} disabled={processing} size="sm">
                  {processing ? "Traitement..." : "Traiter les documents"}
                </Button>
              )}
              {project.status === "ingested" && (
                <Button onClick={() => handleProcessStep("embed")} disabled={processing} size="sm">
                  {processing ? "Analyse..." : "Générer les embeddings"}
                </Button>
              )}
              {project.status === "embedded" && (
                <Button onClick={() => handleProcessStep("generate")} disabled={processing} size="sm">
                  {processing ? "Génération..." : "Générer le rapport"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
          <TabsTrigger value="diagrams">Diagrammes</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {project.report ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu du Rapport
                </CardTitle>
                <CardDescription>
                  Rapport généré le {new Date(project.report.createdAt).toLocaleDateString("fr-FR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {project.report.markdown.substring(0, 2000)}
                      {project.report.markdown.length > 2000 && "..."}
                    </pre>
                  </div>
                </ScrollArea>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    {Math.round(project.report.markdown.length / 1000)}k caractères
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu complet
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <FileOutput className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Rapport non généré</h3>
                  <p className="text-muted-foreground mb-4">
                    Le rapport sera disponible une fois le pipeline RAG terminé
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents Sources ({project.documents.length})
              </CardTitle>
              <CardDescription>Fichiers uploadés et leur statut de traitement</CardDescription>
            </CardHeader>
            <CardContent>
              {project.documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.mime}</Badge>
                        </TableCell>
                        <TableCell>{doc.pages || "-"}</TableCell>
                        <TableCell>{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(doc.status)}>{getStatusLabel(doc.status)}</Badge>
                        </TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun document uploadé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Citations ({project.citations.length})
              </CardTitle>
              <CardDescription>Extraits des documents utilisés dans le rapport</CardDescription>
            </CardHeader>
            <CardContent>
              {project.citations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Extrait</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.citations.map((citation) => (
                      <TableRow key={citation.id}>
                        <TableCell className="font-medium">{citation.document.name}</TableCell>
                        <TableCell>{citation.page}</TableCell>
                        <TableCell>{citation.section}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate">{citation.snippet}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune citation générée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagrams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Diagrammes ({project.diagrams.length})
              </CardTitle>
              <CardDescription>Schémas générés automatiquement</CardDescription>
            </CardHeader>
            <CardContent>
              {project.diagrams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.diagrams.map((diagram) => (
                    <Card key={diagram.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{diagram.title}</CardTitle>
                        <CardDescription>Type: {diagram.kind}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-xs overflow-x-auto">{diagram.mermaid.substring(0, 200)}...</pre>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(diagram.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun diagramme généré</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tables de Données ({project.tables.length})
              </CardTitle>
              <CardDescription>Tableaux CSV générés automatiquement</CardDescription>
            </CardHeader>
            <CardContent>
              {project.tables.length > 0 ? (
                <div className="space-y-4">
                  {project.tables.map((table) => (
                    <Card key={table.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{table.name}</CardTitle>
                        <CardDescription>
                          Généré le {new Date(table.createdAt).toLocaleDateString("fr-FR")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {table.csv.split("\n").slice(0, 5).join("\n")}
                            {table.csv.split("\n").length > 5 && "\n..."}
                          </pre>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger CSV
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune table générée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration du Projet
              </CardTitle>
              <CardDescription>Paramètres et métadonnées du projet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Titre:</strong> {project.title}
                    </div>
                    <div>
                      <strong>Client:</strong> {project.client || "Non spécifié"}
                    </div>
                    <div>
                      <strong>Consultant:</strong> {project.lead || "Non assigné"}
                    </div>
                    <div>
                      <strong>Langue:</strong> {project.language}
                    </div>
                    <div>
                      <strong>Comité:</strong> {project.committee || "Non spécifié"}
                    </div>
                    <div>
                      <strong>Style:</strong> {project.style || "Non spécifié"}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Configuration RAG</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Chunk Size:</strong> {ragOptions.chunkSize || 800}
                    </div>
                    <div>
                      <strong>Overlap:</strong> {ragOptions.overlap || 120}
                    </div>
                    <div>
                      <strong>Top-K:</strong> {ragOptions.topK || 8}
                    </div>
                  </div>
                </div>
              </div>

              {methodologies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Méthodologies sélectionnées</h4>
                  <div className="flex flex-wrap gap-2">
                    {methodologies.map((methodology: string) => (
                      <Badge key={methodology} variant="secondary">
                        {methodology}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Créé le:</strong> {new Date(project.createdAt).toLocaleString("fr-FR")}
                  </div>
                  <div>
                    <strong>Modifié le:</strong> {new Date(project.updatedAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
