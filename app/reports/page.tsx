"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Brain,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
} from "lucide-react"
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

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des projets...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets RAG</h1>
          <p className="text-muted-foreground">
            Gérez vos projets d'ingestion documentaire et de génération de rapports
          </p>
        </div>
        <Link href="/reports/new">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="uploading">Upload en cours</SelectItem>
                  <SelectItem value="ingested">Documents traités</SelectItem>
                  <SelectItem value="embedded">Analyse terminée</SelectItem>
                  <SelectItem value="generating">Génération en cours</SelectItem>
                  <SelectItem value="generated">Rapport généré</SelectItem>
                  <SelectItem value="exported">Exporté</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const StatusIcon = getStatusIcon(project.status)
            const progress = getProgressPercentage(project)

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-muted">
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <Badge className={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {project.client || "Client non spécifié"} • {project.lead || "Consultant non assigné"}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-32 h-2" />
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{project._count.documents} documents</span>
                            <span>{project._count.chunks} chunks</span>
                            <span>{project._count.diagrams} diagrammes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.report && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      )}
                      <Link href={`/reports/${project.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ouvrir
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || statusFilter !== "all" ? "Aucun projet trouvé" : "Aucun projet"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche ou de filtrage"
                    : "Commencez par créer votre premier projet avec ingestion documentaire et génération RAG"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/reports/new">
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un Projet
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Summary */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
            <CardDescription>Statistiques de vos projets RAG</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total projets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter((p) => ["generated", "exported"].includes(p.status)).length}
                </div>
                <div className="text-sm text-muted-foreground">Rapports générés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.reduce((acc, p) => acc + p._count.documents, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Documents traités</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {projects.reduce((acc, p) => acc + p._count.chunks, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Chunks analysés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
