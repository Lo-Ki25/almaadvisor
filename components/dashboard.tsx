"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Plus, Clock, CheckCircle, AlertCircle, TrendingUp, Upload, Brain, FileOutput, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Project {
  id: string
  title: string
  client?: string
  lead?: string
  status: string
  createdAt: string
  updatedAt: string
  _count: {
    documents: number
    chunks: number
    diagrams: number
  }
  report?: {
    id: string
  }
}

export function Dashboard() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    avgCompletionRate: 0,
  })

  useEffect(() => {
    fetchProjects()
  }, []) // fetchProjects is stable, no dependency needed

  const fetchProjects = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
    
    try {
      setError(null)
      setLoading(true)
      const response = await fetch("/api/projects", {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data)

        const completed = data.filter((p: Project) => p.status === "generated" || p.status === "exported").length
        const inProgress = data.filter((p: Project) =>
          ["uploading", "ingested", "embedded", "generating"].includes(p.status),
        ).length

        setStats({
          totalProjects: data.length,
          completedProjects: completed,
          inProgressProjects: inProgress,
          avgCompletionRate: data.length > 0 ? Math.round((completed / data.length) * 100) : 0,
        })
      } else {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      let errorMessage = "Erreur de connexion"
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Délai d'attente dépassé. Veuillez réessayer."
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets. " + errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
      case "exported":
        return CheckCircle
      case "generating":
        return Brain
      case "embedded":
      case "ingested":
        return Clock
      case "uploading":
        return Upload
      case "error":
        return AlertCircle
      default:
        return FileText
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

  const getProgressPercentage = (project: Project) => {
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
    return statusProgress[project.status] || 0
  }

  const recentProjects = projects.slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProjects} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos projets de transformation digitale avec ingestion documentaire et génération RAG
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Système opérationnel</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Dernière synchronisation: maintenant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="lg">
              <Brain className="h-4 w-4 mr-2" />
              Administration
            </Button>
          </Link>
          <Link href="/reports/new">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Projet
            </Button>
          </Link>
        </div>
      </div>

      {/* Pipeline Status Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Pipeline RAG - Ingestion → Analyse → Génération
          </CardTitle>
          <CardDescription>
            Processus complet : Upload documents → Parsing & Chunking → Embeddings → Génération rapport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Upload className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-medium">Upload</p>
                <p className="text-sm text-muted-foreground">Documents sources</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Ingestion</p>
                <p className="text-sm text-muted-foreground">Parsing & chunking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Embeddings</p>
                <p className="text-sm text-muted-foreground">Analyse sémantique</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileOutput className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Génération</p>
                <p className="text-sm text-muted-foreground">Rapport final</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="space-y-4">
        <div className="pb-2 border-b">
          <h2 className="text-xl font-semibold">Vue d'ensemble</h2>
          <p className="text-sm text-muted-foreground">Statistiques et métriques clé de vos projets</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Projets de transformation</p>
              <div className="mt-2 text-xs text-green-600">
                +{stats.totalProjects > 0 ? '1' : '0'} ce mois
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rapports Générés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground">Prêts à exporter</p>
              <div className="mt-2 text-xs text-green-600">
                ✓ {stats.avgCompletionRate}% de réussite
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Traitement</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressProjects}</div>
              <p className="text-xs text-muted-foreground">Pipeline actif</p>
              <div className="mt-2 text-xs text-blue-600">
                {stats.inProgressProjects > 0 ? '⚡ Actif' : '😴 Inactif'}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">Projets aboutis</p>
              <div className="mt-2 text-xs text-purple-600">
                {stats.avgCompletionRate >= 80 ? '🚀 Excellent' : stats.avgCompletionRate >= 60 ? '📈 Bien' : '🎯 Améliorable'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Projets Récents</CardTitle>
          <CardDescription>Vos derniers projets avec leur statut dans le pipeline RAG</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const StatusIcon = getStatusIcon(project.status)
                const progress = getProgressPercentage(project)

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.client || "Client non spécifié"}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-24 h-2" />
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {project._count.documents} docs • {project._count.chunks} chunks
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
                      <Link href={`/reports/${project.id}`}>
                        <Button variant="outline" size="sm">
                          Ouvrir
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun projet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Commencez par créer votre premier projet avec ingestion documentaire et génération automatique de
                rapport
              </p>
              <Link href="/reports/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un Projet
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
