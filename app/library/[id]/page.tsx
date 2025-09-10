"use client"

import React, { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Share2, 
  Heart, 
  Calendar,
  User,
  FileText,
  Hash,
  TrendingUp,
  Clock,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { mockResources } from '@/lib/data/mock-resources'
import { useResourceActions, useResourceStore } from '@/hooks/use-resource-store'
import { 
  Resource, 
  RESOURCE_CATEGORY_LABELS, 
  RESOURCE_STATUS_LABELS 
} from '@/lib/types/resource'
import { formatFileSize } from '@/lib/utils'
import { ResourcePreview } from '@/components/library/resource-preview'
import { ResourceMetadata } from '@/components/library/resource-metadata'

interface ResourcePageProps {
  params: {
    id: string
  }
}

export default function ResourcePage({ params }: ResourcePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    handleDownload, 
    handleView, 
    handleFavorite, 
    handleShare, 
    getResourceStats, 
    isFavorite 
  } = useResourceActions()
  
  const updateResource = useResourceStore((state) => state.updateResource)

  // Simuler le chargement de la ressource
  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const foundResource = mockResources.find(r => r.id === params.id)
        
        if (!foundResource) {
          setError('Ressource introuvable')
          return
        }
        
        setResource(foundResource)
        
        // Initialiser les données dans le store si nécessaire
        const storeResource = useResourceStore.getState().getResource(params.id)
        if (!storeResource) {
          updateResource(params.id, foundResource)
        }
        
        // Enregistrer la vue
        await handleView(foundResource)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadResource()
  }, [params.id, handleView, updateResource])

  // Gestion des actions
  const onDownload = async () => {
    if (!resource) return
    
    const result = await handleDownload(resource)
    toast({
      title: result.success ? "Téléchargement" : "Erreur",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    })
  }

  const onFavorite = async () => {
    if (!resource) return
    
    const result = await handleFavorite(resource)
    toast({
      title: result.success ? "Favoris" : "Erreur",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    })
  }

  const onShare = async () => {
    if (!resource) return
    
    const result = await handleShare(resource)
    toast({
      title: result.success ? "Partage" : "Erreur",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    })
  }

  const getStatusIcon = (status: Resource['status']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
            <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
            <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Ressource introuvable</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'La ressource demandée n\'existe pas ou n\'est plus disponible.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/library')}>
          Retour à la bibliothèque
        </Button>
      </div>
    )
  }

  const resourceStats = getResourceStats(resource.id)
  const isResourceFavorite = isFavorite(resource.id)

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{resource.title}</h1>
          <p className="text-muted-foreground">{resource.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aperçu de la ressource */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu
              </CardTitle>
              <CardDescription>
                Prévisualisation du contenu de la ressource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourcePreview resource={resource} />
            </CardContent>
          </Card>

          {/* Métadonnées détaillées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Métadonnées
              </CardTitle>
              <CardDescription>
                Informations détaillées sur la ressource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceMetadata resource={resource} />
            </CardContent>
          </Card>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Actions principales */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={onDownload}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onFavorite}
                  className="flex-1"
                >
                  <Heart 
                    className={`h-4 w-4 mr-2 ${isResourceFavorite ? 'fill-current text-red-500' : ''}`}
                  />
                  {isResourceFavorite ? 'Favoris' : 'Ajouter'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut</span>
                <Badge className={`flex items-center gap-1 ${getStatusColor(resource.status)}`}>
                  {getStatusIcon(resource.status)}
                  {RESOURCE_STATUS_LABELS[resource.status]}
                </Badge>
              </div>

              {/* Catégorie */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Catégorie</span>
                <Badge variant="secondary">
                  {RESOURCE_CATEGORY_LABELS[resource.category]}
                </Badge>
              </div>

              <Separator />

              {/* Taille */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taille</span>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(resource.size)}
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm text-muted-foreground uppercase">
                  {resource.type}
                </span>
              </div>

              {/* Version */}
              {resource.version && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version</span>
                  <span className="text-sm text-muted-foreground">
                    v{resource.version}
                  </span>
                </div>
              )}

              <Separator />

              {/* Auteur */}
              {resource.author && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Auteur
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {resource.author}
                  </span>
                </div>
              )}

              {/* Date d'upload */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Créé le
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(resource.uploadedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Dernière vue */}
              {resource.lastViewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernière vue
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(resource.lastViewedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}

              <Separator />

              {/* Checksum */}
              <div className="space-y-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Checksum (MD5)
                </span>
                <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded break-all">
                  {resource.checksum}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {resourceStats.views}
                  </div>
                  <div className="text-xs text-muted-foreground">Vues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {resourceStats.downloads}
                  </div>
                  <div className="text-xs text-muted-foreground">Téléchargements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
