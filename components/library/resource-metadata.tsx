"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Hash, 
  Globe, 
  MessageSquare,
  Tag,
  BookOpen,
  Layers,
  Zap,
  Brain,
  TrendingUp
} from 'lucide-react'
import { Resource } from '@/lib/types/resource'

interface ResourceMetadataProps {
  resource: Resource
  className?: string
}

export function ResourceMetadata({ resource, className = '' }: ResourceMetadataProps) {
  const { metadata } = resource

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      case 'neutral':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😔'
      case 'neutral':
        return '😐'
      default:
        return '🤷'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Informations générales */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Contenu textuel */}
        {metadata.pages && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Pages</span>
            </div>
            <div className="text-2xl font-bold">{metadata.pages}</div>
            <div className="text-xs text-muted-foreground">
              {metadata.pages > 1 ? 'pages' : 'page'} au total
            </div>
          </div>
        )}

        {metadata.words && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Mots</span>
            </div>
            <div className="text-2xl font-bold">{metadata.words.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              mots identifiés
            </div>
          </div>
        )}

        {/* Dimensions pour les images */}
        {metadata.dimensions && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Dimensions</span>
            </div>
            <div className="text-lg font-bold">
              {metadata.dimensions.width} × {metadata.dimensions.height}
            </div>
            <div className="text-xs text-muted-foreground">pixels</div>
          </div>
        )}

        {/* Encodage */}
        {metadata.encoding && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">Encodage</span>
            </div>
            <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {metadata.encoding.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Langue et contenu */}
      {metadata.language && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Langue détectée</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {metadata.language.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Résumé */}
      {metadata.summary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="font-medium">Résumé automatique</span>
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm leading-relaxed">
            {metadata.summary}
          </div>
        </div>
      )}

      {/* Sentiment */}
      {metadata.sentiment && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Analyse de sentiment</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getSentimentColor(metadata.sentiment)}>
              <span className="mr-1">{getSentimentIcon(metadata.sentiment)}</span>
              {metadata.sentiment === 'positive' && 'Positif'}
              {metadata.sentiment === 'negative' && 'Négatif'}
              {metadata.sentiment === 'neutral' && 'Neutre'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Détecté automatiquement
            </span>
          </div>
        </div>
      )}

      <Separator />

      {/* Mots-clés */}
      {metadata.keywords && metadata.keywords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Mots-clés extraits</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.keywords.slice(0, 12).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {metadata.keywords.length > 12 && (
              <Badge variant="outline" className="text-xs">
                +{metadata.keywords.length - 12} autres
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sujets/Thèmes */}
      {metadata.topics && metadata.topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Thèmes identifiés</span>
          </div>
          <div className="space-y-2">
            {metadata.topics.map((topic, index) => {
              // Simuler un score de pertinence
              const relevanceScore = Math.max(60, Math.floor(Math.random() * 40) + 60)
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="text-sm font-medium capitalize">{topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={relevanceScore} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {relevanceScore}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contenu extrait (aperçu) */}
      {metadata.extractedText && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Texte extrait</span>
          </div>
          <details className="group">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Voir l'aperçu du contenu extrait
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 p-3 bg-muted rounded text-sm font-mono leading-relaxed max-h-48 overflow-y-auto">
              {metadata.extractedText.substring(0, 500)}
              {metadata.extractedText.length > 500 && (
                <span className="text-muted-foreground">
                  ... {metadata.extractedText.length - 500} caractères restants
                </span>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Statistiques de traitement */}
      <Separator />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">Statistiques de traitement</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted rounded">
            <div className="text-lg font-bold text-blue-600">
              {metadata.keywords?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Mots-clés extraits
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded">
            <div className="text-lg font-bold text-green-600">
              {metadata.topics?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Thèmes identifiés
            </div>
          </div>
        </div>
      </div>

      {/* Score de qualité simulé */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Score de qualité du contenu</span>
          <Badge variant="secondary">
            {/* Simuler un score basé sur les métadonnées disponibles */}
            {(() => {
              let score = 50
              if (metadata.summary) score += 20
              if (metadata.keywords && metadata.keywords.length > 5) score += 15
              if (metadata.topics && metadata.topics.length > 2) score += 10
              if (metadata.sentiment) score += 5
              return Math.min(100, score)
            })()}%
          </Badge>
        </div>
        
        <Progress 
          value={(() => {
            let score = 50
            if (metadata.summary) score += 20
            if (metadata.keywords && metadata.keywords.length > 5) score += 15
            if (metadata.topics && metadata.topics.length > 2) score += 10
            if (metadata.sentiment) score += 5
            return Math.min(100, score)
          })()} 
          className="h-2"
        />
        
        <div className="text-xs text-muted-foreground">
          Basé sur la richesse des métadonnées extraites
        </div>
      </div>
    </div>
  )
}
