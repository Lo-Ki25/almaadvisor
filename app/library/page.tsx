"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  File,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  ArrowUpDown,
  Heart,
  Share2,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  Grid3X3,
  List
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DataState, DataSkeleton, LibraryEmptyState, SearchEmptyState } from "@/components/ui/states"
import { mockResources, filterResources, sortResources, getAllTags, getAllAuthors } from "@/lib/data/mock-resources"
import { useResourceActions, useResourceStats, useResourceStore } from "@/hooks/use-resource-store"
import { 
  Resource, 
  ResourceSortOption,
  RESOURCE_SORT_LABELS,
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_STATUS_LABELS 
} from "@/lib/types/resource"
import { formatFileSize } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// API simulation for resources
async function fetchResources(): Promise<Resource[]> {
  // Simuler un délai de chargement
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockResources)
    }, 1000)
  })
}

export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // États de filtrage et tri
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [authorFilter, setAuthorFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<ResourceSortOption>("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Hooks pour les actions et stats
  const { handleDownload, handleView, handleFavorite, handleShare, isFavorite } = useResourceActions()
  const { getAllStats, getPopularResources } = useResourceStats()
  const updateResource = useResourceStore((state) => state.updateResource)
  
  // Récupération des données
  const { data: resources = [], isLoading, error, refetch } = useQuery({
    queryKey: ['library-resources'],
    queryFn: fetchResources,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
  
  // Initialiser le store avec les données
  useEffect(() => {
    resources.forEach(resource => {
      const storeResource = useResourceStore.getState().getResource(resource.id)
      if (!storeResource) {
        updateResource(resource.id, resource)
      }
    })
  }, [resources, updateResource])

  // Utilitaires
  const getFileIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return FileText
      case 'docx':
        return File
      case 'xlsx':
      case 'csv':
        return FileSpreadsheet
      case 'jpg':
      case 'png':
      case 'svg':
        return Image
      case 'md':
      case 'txt':
        return FileText
      default:
        return FileText
    }
  }

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'processed':
        return "bg-green-100 text-green-800"
      case 'pending':
        return "bg-yellow-100 text-yellow-800"
      case 'processing':
        return "bg-blue-100 text-blue-800"
      case 'error':
        return "bg-red-100 text-red-800"
      case 'archived':
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calcul des données filtrées et triées
  const filteredAndSortedResources = useMemo(() => {
    let result = resources

    // Filtrage par recherche, catégorie, type, statut et auteur
    const filters = {
      search: searchTerm,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      author: authorFilter === "all" ? undefined : authorFilter,
    }

    result = filterResources(result, filters)
    
    // Filtrage par onglet actif (favoris, récents, populaires)
    if (activeTab === "favorites") {
      result = result.filter(resource => isFavorite(resource.id))
    } else if (activeTab === "recent") {
      // Récents = dernière semaine
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      result = result.filter(resource => new Date(resource.metadata.dateCreated) >= weekAgo)
    } else if (activeTab === "popular") {
      const stats = getAllStats()
      const popularIds = Object.entries(stats)
        .filter(([_, stat]) => stat.downloadCount > 0)
        .sort(([,a], [,b]) => b.downloadCount - a.downloadCount)
        .slice(0, 20)
        .map(([id]) => id)
      result = result.filter(resource => popularIds.includes(resource.id))
    }

    // Tri
    result = sortResources(result, sortBy)

    return result
  }, [resources, searchTerm, categoryFilter, typeFilter, statusFilter, authorFilter, sortBy, activeTab, isFavorite, getAllStats])

  // Données pour les filtres
  const allTags = useMemo(() => getAllTags(resources), [resources])
  const allAuthors = useMemo(() => getAllAuthors(resources), [resources])
  const categories = Object.keys(RESOURCE_CATEGORY_LABELS)
  const statuses = Object.keys(RESOURCE_STATUS_LABELS)
  const types = [...new Set(resources.map(r => r.type))]

  // Gestion des actions de ressource
  const handleResourceDownload = async (resource: Resource) => {
    try {
      await handleDownload(resource)
      toast({ title: "Téléchargement démarré", description: `${resource.metadata.title}` })
    } catch (error) {
      toast({ 
        title: "Erreur de téléchargement", 
        description: "Impossible de télécharger la ressource", 
        variant: "destructive" 
      })
    }
  }

  const handleResourceView = async (resource: Resource) => {
    try {
      await handleView(resource)
      router.push(`/library/${resource.id}`)
    } catch (error) {
      toast({ 
        title: "Erreur d'ouverture", 
        description: "Impossible d'ouvrir la ressource", 
        variant: "destructive" 
      })
    }
  }

  const handleResourceFavorite = async (resource: Resource) => {
    try {
      await handleFavorite(resource)
      const isNowFavorite = isFavorite(resource.id)
      toast({ 
        title: isNowFavorite ? "Ajouté aux favoris" : "Retiré des favoris", 
        description: resource.metadata.title 
      })
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de modifier les favoris", 
        variant: "destructive" 
      })
    }
  }

  const handleResourceShare = async (resource: Resource) => {
    try {
      await handleShare(resource)
      toast({ title: "Lien copié", description: "Le lien vers la ressource a été copié" })
    } catch (error) {
      toast({ 
        title: "Erreur de partage", 
        description: "Impossible de partager la ressource", 
        variant: "destructive" 
      })
    }
  }

  // Composant ResourceCard amélioré
  const ResourceCard = ({ resource, viewMode }: { resource: Resource; viewMode: "grid" | "list" }) => {
    const IconComponent = getFileIcon(resource.type)
    const isResourceFavorite = isFavorite(resource.id)
    const stats = getAllStats()
    const resourceStats = stats[resource.id]

    if (viewMode === "list") {
      return (
        <Card key={resource.id} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-shrink-0">
              <IconComponent className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium truncate">{resource.metadata.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={getStatusColor(resource.status)}>
                    {RESOURCE_STATUS_LABELS[resource.status]}
                  </Badge>
                  {isResourceFavorite && <Heart className="h-4 w-4 text-red-500 fill-red-500" />}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>{formatFileSize(resource.metadata.size)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {resource.metadata.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(resource.metadata.dateCreated).toLocaleDateString('fr-FR')}
                </span>
                {resourceStats && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {resourceStats.downloadCount}
                    </span>
                  </>
                )}
              </div>
              
              {resource.metadata.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                  {resource.metadata.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResourceView(resource)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResourceDownload(resource)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResourceFavorite(resource)}
              >
                <Heart className={`h-4 w-4 ${isResourceFavorite ? 'text-red-500 fill-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResourceShare(resource)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Mode grille
    return (
      <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <Badge className={getStatusColor(resource.status)}>
                {RESOURCE_STATUS_LABELS[resource.status]}
              </Badge>
            </div>
            {isResourceFavorite && <Heart className="h-4 w-4 text-red-500 fill-red-500" />}
          </div>
          
          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
            {resource.metadata.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          {resource.metadata.description && (
            <CardDescription className="line-clamp-3 mb-3">
              {resource.metadata.description}
            </CardDescription>
          )}
          
          <div className="space-y-2 text-xs text-muted-foreground mb-4">
            <div className="flex items-center justify-between">
              <span>{formatFileSize(resource.metadata.size)}</span>
              {resourceStats && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {resourceStats.downloadCount + resourceStats.viewCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{resource.metadata.author}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(resource.metadata.dateCreated).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          {resource.metadata.tags && resource.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {resource.metadata.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {resource.metadata.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{resource.metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleResourceView(resource)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResourceDownload(resource)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResourceFavorite(resource)}
            >
              <Heart className={`h-4 w-4 ${isResourceFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResourceShare(resource)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Bibliothèque de Ressources</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button 
              size="sm" 
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ressource
          </Button>
        </div>
      </div>

      {/* Tabs pour filtres rapides */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="recent">Récentes</TabsTrigger>
          <TabsTrigger value="popular">Populaires</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtres avancés */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, description, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {RESOURCE_CATEGORY_LABELS[category as keyof typeof RESOURCE_CATEGORY_LABELS]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {RESOURCE_STATUS_LABELS[status as keyof typeof RESOURCE_STATUS_LABELS]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Auteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous auteurs</SelectItem>
              {allAuthors.map(author => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as ResourceSortOption)}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RESOURCE_SORT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium">{resources.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Filtrées</p>
              <p className="font-medium">{filteredAndSortedResources.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Favoris</p>
              <p className="font-medium">
                {resources.filter(resource => isFavorite(resource.id)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <Download className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Téléchargements</p>
              <p className="font-medium">
                {Object.values(getAllStats()).reduce((acc, stat) => acc + stat.downloadCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des ressources */}
      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={filteredAndSortedResources.length === 0}
        hasSearchTerm={!!searchTerm || categoryFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || authorFilter !== "all"}
        onRetry={refetch}
        loadingComponent={<DataSkeleton />}
        emptyComponent={<LibraryEmptyState />}
        searchEmptyComponent={
          <SearchEmptyState 
            onClear={() => { 
              setSearchTerm('')
              setCategoryFilter('all')
              setTypeFilter('all')
              setStatusFilter('all')
              setAuthorFilter('all')
              setSortBy('recent')
              setActiveTab('all')
            }} 
          />
        }
      >
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredAndSortedResources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              viewMode={viewMode} 
            />
          ))}
        </div>
      </DataState>
    </div>
  )
}
