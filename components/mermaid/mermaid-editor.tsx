"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Palette, 
  Code, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  Columns,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { MermaidPreview } from './mermaid-preview'
import { diagramTemplates, getAllCategories, getTemplateById } from '@/lib/mermaid-templates'
import { useToast } from '@/components/ui/use-toast'

interface MermaidEditorProps {
  initialCode?: string
  initialDiagramType?: string
  onSave?: (code: string, diagramType: string) => void
  maxCharacters?: number
  className?: string
}

export function MermaidEditor({
  initialCode = '',
  initialDiagramType = 'c4-context',
  onSave,
  maxCharacters = 10000,
  className = ''
}: MermaidEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [debouncedCode, setDebouncedCode] = useState(initialCode)
  const [diagramType, setDiagramType] = useState(initialDiagramType)
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [characterCount, setCharacterCount] = useState(initialCode.length)
  const { toast } = useToast()

  // Debounced code pour éviter trop de re-rendus
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [code])

  // Mise à jour du compteur de caractères
  useEffect(() => {
    setCharacterCount(code.length)
  }, [code])

  // Charger un template
  const loadTemplate = useCallback((templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setCode(template.template)
      setDiagramType(templateId)
      toast({
        title: "Template chargé",
        description: `Template "${template.name}" chargé avec succès`
      })
    }
  }, [toast])

  // Gérer les changements de code avec limite de caractères
  const handleCodeChange = (newCode: string) => {
    if (newCode.length <= maxCharacters) {
      setCode(newCode)
      setHasError(false)
    } else {
      toast({
        title: "Limite atteinte",
        description: `Le code ne peut pas dépasser ${maxCharacters.toLocaleString()} caractères`,
        variant: "destructive"
      })
    }
  }

  // Gestion des erreurs de preview
  const handlePreviewError = (error: string) => {
    setHasError(true)
  }

  const handlePreviewSuccess = () => {
    setHasError(false)
  }

  // Sauvegarder
  const handleSave = () => {
    if (code.trim()) {
      onSave?.(code, diagramType)
      toast({
        title: "Sauvegardé",
        description: "Le diagramme a été sauvegardé avec succès"
      })
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder un diagramme vide",
        variant: "destructive"
      })
    }
  }

  // Réinitialiser
  const handleReset = () => {
    const template = getTemplateById(diagramType)
    if (template) {
      setCode(template.template)
      toast({
        title: "Code réinitialisé",
        description: "Le code a été restauré au template original"
      })
    }
  }

  // Formatage du compteur de caractères
  const getCharacterCountColor = () => {
    const percentage = (characterCount / maxCharacters) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-amber-600'
    return 'text-muted-foreground'
  }

  // Obtenir les catégories et templates
  const categories = getAllCategories()
  const selectedTemplate = getTemplateById(diagramType)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête avec contrôles */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Éditeur de Diagrammes Mermaid
              </CardTitle>
              <CardDescription>
                Créez et éditez des diagrammes avec preview en temps réel
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Contrôles de vue */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'code' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('code')}
                  className="rounded-none border-0"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="rounded-none border-0 border-l"
                >
                  <Columns className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="rounded-none border-0 border-l"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Fullscreen toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Sélection de template */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Template de diagramme</label>
              <Select value={diagramType} onValueChange={loadTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un template" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                        {category}
                      </div>
                      {diagramTemplates
                        .filter(template => template.category === category)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {onSave && (
                <Button onClick={handleSave} disabled={!code.trim() || hasError}>
                  <FileText className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              )}
            </div>
          </div>

          {/* Info template */}
          {selectedTemplate && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedTemplate.category}</Badge>
              <span className="text-sm text-muted-foreground">{selectedTemplate.description}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone d'édition principal */}
      <div className={`${isFullscreen ? 'fixed inset-4 z-50 bg-background' : ''}`}>
        <div className="grid gap-4 h-full" style={{
          gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
          minHeight: isFullscreen ? 'calc(100vh - 2rem)' : '600px'
        }}>
          {/* Éditeur de code */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Code Mermaid</CardTitle>
                    <CardDescription>
                      Modifiez le code pour personnaliser votre diagramme
                    </CardDescription>
                  </div>
                  <div className={`text-sm ${getCharacterCountColor()}`}>
                    {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()}
                    {characterCount > maxCharacters * 0.9 && (
                      <span className="ml-2 text-xs">
                        ({Math.round((characterCount / maxCharacters) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="font-mono text-sm resize-none flex-1"
                  placeholder="Entrez votre code Mermaid ici..."
                  style={{ minHeight: '400px' }}
                />
                
                {/* Avertissement limite de caractères */}
                {characterCount > maxCharacters * 0.8 && (
                  <Alert className="mt-3" variant={characterCount > maxCharacters * 0.95 ? "destructive" : "default"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {characterCount > maxCharacters * 0.95 ? (
                        <>Vous approchez de la limite de {maxCharacters.toLocaleString()} caractères</>
                      ) : (
                        <>Limite de caractères: {characterCount.toLocaleString()}/{maxCharacters.toLocaleString()}</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>
                  Prévisualisation en temps réel de votre diagramme
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <MermaidPreview
                  code={debouncedCode}
                  diagramType={diagramType}
                  onError={handlePreviewError}
                  onSuccess={handlePreviewSuccess}
                  className="flex-1"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fermer fullscreen */}
        {isFullscreen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4"
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Fermer plein écran
          </Button>
        )}
      </div>
    </div>
  )
}
