"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet,
  Code,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  Maximize2
} from 'lucide-react'
import { Resource } from '@/lib/types/resource'

interface ResourcePreviewProps {
  resource: Resource
  className?: string
}

export function ResourcePreview({ resource, className = '' }: ResourcePreviewProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getPreviewComponent = () => {
    switch (resource.type) {
      case 'md':
        return <MarkdownPreview resource={resource} showFull={showFullContent} />
      
      case 'txt':
        return <TextPreview resource={resource} showFull={showFullContent} />
      
      case 'pdf':
        return <PDFPreview resource={resource} />
      
      case 'png':
      case 'jpg':
      case 'svg':
        return <ImagePreview resource={resource} onError={setImageError} />
      
      case 'json':
      case 'yaml':
      case 'xml':
        return <CodePreview resource={resource} showFull={showFullContent} />
      
      case 'docx':
        return <DocumentPreview resource={resource} showFull={showFullContent} />
      
      case 'xlsx':
      case 'csv':
        return <SpreadsheetPreview resource={resource} />
      
      default:
        return <UnsupportedPreview resource={resource} />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contrôles d'aperçu */}
      {(resource.content || resource.type === 'pdf' || ['png', 'jpg', 'svg'].includes(resource.type)) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Aperçu du contenu</span>
          </div>
          
          {resource.content && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Réduire
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3 w-3 mr-1" />
                    Voir tout
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Contenu de l'aperçu */}
      <div className="border rounded-lg">
        {getPreviewComponent()}
      </div>
    </div>
  )
}

// Composant pour l'aperçu Markdown
function MarkdownPreview({ resource, showFull }: { resource: Resource; showFull: boolean }) {
  if (!resource.content) {
    return <EmptyPreview type="Markdown" />
  }

  const content = showFull ? resource.content : resource.content.substring(0, 500)
  const isLong = resource.content.length > 500

  return (
    <div className="p-4">
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-3 rounded">
          {content}
          {!showFull && isLong && (
            <span className="text-muted-foreground">
              \n\n... {resource.content.length - 500} caractères restants
            </span>
          )}
        </pre>
      </div>
    </div>
  )
}

// Composant pour l'aperçu texte
function TextPreview({ resource, showFull }: { resource: Resource; showFull: boolean }) {
  if (!resource.content) {
    return <EmptyPreview type="Texte" />
  }

  const content = showFull ? resource.content : resource.content.substring(0, 300)
  const isLong = resource.content.length > 300

  return (
    <div className="p-4">
      <div className="text-sm leading-relaxed">
        {content}
        {!showFull && isLong && (
          <span className="text-muted-foreground">
            ... {resource.content.length - 300} caractères restants
          </span>
        )}
      </div>
    </div>
  )
}

// Composant pour l'aperçu PDF
function PDFPreview({ resource }: { resource: Resource }) {
  return (
    <div className="p-4 text-center">
      <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
      <h3 className="font-medium mb-2">Document PDF</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {resource.metadata.pages 
          ? `${resource.metadata.pages} pages • ${(resource.size / 1024 / 1024).toFixed(1)} MB`
          : 'Aperçu non disponible'
        }
      </p>
      
      {resource.previewUrl ? (
        <div className="space-y-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ouvrir dans un nouvel onglet
          </Button>
          <iframe
            src={`${resource.previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-96 border rounded"
            title={`Aperçu de ${resource.title}`}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Téléchargez le fichier pour le consulter
        </p>
      )}
    </div>
  )
}

// Composant pour l'aperçu image
function ImagePreview({ resource, onError }: { resource: Resource; onError: (error: boolean) => void }) {
  const [loaded, setLoaded] = useState(false)

  const handleImageLoad = () => {
    setLoaded(true)
    onError(false)
  }

  const handleImageError = () => {
    onError(true)
  }

  return (
    <div className="p-4 text-center">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5" />
        <span className="font-medium">Image</span>
        {resource.metadata.dimensions && (
          <span className="text-sm text-muted-foreground">
            {resource.metadata.dimensions.width} × {resource.metadata.dimensions.height}
          </span>
        )}
      </div>
      
      {resource.thumbnailUrl ? (
        <div className="space-y-3">
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className={`max-w-full max-h-96 mx-auto rounded border transition-opacity duration-200 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {!loaded && (
            <div className="h-48 bg-muted animate-pulse rounded" />
          )}
        </div>
      ) : (
        <div className="h-48 bg-muted rounded flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// Composant pour l'aperçu code
function CodePreview({ resource, showFull }: { resource: Resource; showFull: boolean }) {
  if (!resource.content) {
    return <EmptyPreview type="Code" />
  }

  const content = showFull ? resource.content : resource.content.substring(0, 800)
  const isLong = resource.content.length > 800

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Code className="h-4 w-4" />
        <span className="font-medium text-sm">
          {resource.type.toUpperCase()}
        </span>
      </div>
      
      <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
        <code>{content}</code>
      </pre>
      
      {!showFull && isLong && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          ... {resource.content.length - 800} caractères restants
        </p>
      )}
    </div>
  )
}

// Composant pour l'aperçu document
function DocumentPreview({ resource, showFull }: { resource: Resource; showFull: boolean }) {
  return (
    <div className="p-4 text-center">
      <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
      <h3 className="font-medium mb-2">Document Word</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {resource.metadata.words 
          ? `${resource.metadata.words.toLocaleString()} mots`
          : 'Métadonnées non disponibles'
        }
      </p>
      
      {resource.content && (
        <div className="text-left">
          <div className="text-sm bg-muted p-3 rounded leading-relaxed">
            {showFull ? resource.content : `${resource.content.substring(0, 200)}...`}
          </div>
        </div>
      )}
      
      {!resource.content && (
        <p className="text-sm text-muted-foreground">
          Téléchargez le fichier pour le consulter
        </p>
      )}
    </div>
  )
}

// Composant pour l'aperçu tableur
function SpreadsheetPreview({ resource }: { resource: Resource }) {
  return (
    <div className="p-4 text-center">
      <FileSpreadsheet className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h3 className="font-medium mb-2">
        {resource.type === 'csv' ? 'Fichier CSV' : 'Tableur Excel'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Données structurées • {(resource.size / 1024).toFixed(0)} KB
      </p>
      
      <p className="text-sm text-muted-foreground">
        Téléchargez le fichier pour consulter les données
      </p>
      
      <Button variant="outline" size="sm" className="mt-3">
        <Download className="h-4 w-4 mr-2" />
        Télécharger pour ouvrir
      </Button>
    </div>
  )
}

// Composant pour les types non supportés
function UnsupportedPreview({ resource }: { resource: Resource }) {
  return (
    <div className="p-4 text-center">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          L'aperçu n'est pas disponible pour ce type de fichier ({resource.type.toUpperCase()}).
          Téléchargez le fichier pour le consulter.
        </AlertDescription>
      </Alert>
      
      <Button variant="outline" size="sm" className="mt-3">
        <Download className="h-4 w-4 mr-2" />
        Télécharger le fichier
      </Button>
    </div>
  )
}

// Composant pour les aperçus vides
function EmptyPreview({ type }: { type: string }) {
  return (
    <div className="p-4 text-center">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aucun contenu d'aperçu disponible pour ce fichier {type}.
        </AlertDescription>
      </Alert>
    </div>
  )
}
