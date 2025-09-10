"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Download, Copy, FileImage } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { 
  exportSVG, 
  exportPNG, 
  copySVGToClipboard, 
  downloadFile, 
  generateFilename 
} from '@/lib/mermaid-export'

interface MermaidPreviewProps {
  code: string
  diagramType?: string
  onError?: (error: string) => void
  onSuccess?: () => void
  className?: string
  width?: number
  height?: number
}

interface MermaidError {
  message: string
  line?: number
  column?: number
  details?: string
}

export function MermaidPreview({
  code,
  diagramType = 'diagram',
  onError,
  onSuccess,
  className = '',
  width,
  height
}: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<MermaidError | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Configuration Mermaid optimisée
  const initializeMermaid = useCallback(async () => {
    try {
      const mermaid = (await import('mermaid')).default
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        themeVariables: {
          primaryColor: '#059669',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#047857',
          lineColor: '#6b7280',
          sectionBkgColor: '#f9fafb',
          altSectionBkgColor: '#ffffff',
          gridColor: '#e5e7eb',
          secondaryColor: '#10b981',
          tertiaryColor: '#f3f4f6',
          background: '#ffffff',
          mainBkg: '#ffffff',
          secondBkg: '#f9fafb',
          tertiaryBkg: '#f3f4f6',
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          useMaxWidth: true,
        },
        gantt: {
          useMaxWidth: true,
          leftPadding: 75,
          rightPadding: 20,
          gridLineStartPadding: 35,
          fontSize: 12,
          sectionFontSize: 14,
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 50,
          diagramMarginY: 10,
        },
        pie: {
          useMaxWidth: true,
        },
        journey: {
          useMaxWidth: true,
        },
        timeline: {
          useMaxWidth: true,
        },
        mindmap: {
          useMaxWidth: true,
        },
        gitgraph: {
          useMaxWidth: true,
        },
        c4: {
          useMaxWidth: true,
        },
        sankey: {
          useMaxWidth: true,
        },
        block: {
          useMaxWidth: true,
        },
        // Configuration de sécurité
        securityLevel: 'strict',
        suppressErrorRendering: false,
      })
      
      return mermaid
    } catch (error) {
      throw new Error(`Erreur d'initialisation de Mermaid: ${error}`)
    }
  }, [])

  // Fonction de rendu du diagramme
  const renderDiagram = useCallback(async () => {
    if (!containerRef.current || !code.trim()) {
      setError(null)
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full text-muted-foreground">
            <div class="text-center">
              <FileImage class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Entrez votre code Mermaid pour voir le diagramme</p>
            </div>
          </div>
        `
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const mermaid = await initializeMermaid()
      
      // Générer un ID unique pour éviter les conflits
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Vider le conteneur
      containerRef.current.innerHTML = ''
      
      // Valider et rendre le diagramme
      const result = await mermaid.parse(code)
      if (result) {
        const { svg } = await mermaid.render(diagramId, code)
        containerRef.current.innerHTML = svg
        
        // Appliquer les dimensions si spécifiées
        const svgElement = containerRef.current.querySelector('svg')
        if (svgElement) {
          if (width) svgElement.setAttribute('width', width.toString())
          if (height) svgElement.setAttribute('height', height.toString())
          
          // Assurer que le SVG est responsive
          svgElement.setAttribute('style', 'max-width: 100%; height: auto;')
        }
        
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Erreur de rendu Mermaid:', error)
      
      // Parser l'erreur pour extraire des informations utiles
      const parsedError = parseMermaidError(error, code)
      setError(parsedError)
      onError?.(parsedError.message)
      
      // Afficher l'erreur dans le conteneur
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center p-4">
              <div class="text-red-500 mb-2">
                <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <p class="text-sm font-medium text-red-900">Erreur de syntaxe</p>
              <p class="text-xs text-red-700 mt-1">Vérifiez votre code Mermaid</p>
            </div>
          </div>
        `
      }
    } finally {
      setIsLoading(false)
    }
  }, [code, diagramType, width, height, initializeMermaid, onError, onSuccess])

  // Parser les erreurs Mermaid pour extraire des informations utiles
  const parseMermaidError = (error: any, code: string): MermaidError => {
    let message = 'Erreur de syntaxe dans le diagramme Mermaid'
    let line: number | undefined
    let column: number | undefined
    let details: string | undefined

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('lexical error') || errorMessage.includes('syntax error')) {
        message = 'Erreur de syntaxe : vérifiez la structure de votre diagramme'
        
        // Essayer d'extraire le numéro de ligne
        const lineMatch = error.message.match(/line (\d+)/i)
        if (lineMatch) line = parseInt(lineMatch[1])
      } else if (errorMessage.includes('parse error')) {
        message = 'Erreur de parsing : le format du diagramme n\'est pas reconnu'
      } else if (errorMessage.includes('graph') && errorMessage.includes('direction')) {
        message = 'Direction de graphique invalide (utilisez TB, BT, LR, ou RL)'
      } else if (errorMessage.includes('subgraph')) {
        message = 'Erreur dans la définition du sous-graphique'
      } else if (errorMessage.includes('flowchart')) {
        message = 'Erreur dans la syntaxe du flowchart'
      } else if (errorMessage.includes('gantt')) {
        message = 'Erreur dans la syntaxe du diagramme de Gantt'
      }
      
      details = error.message
    }

    return { message, line, column, details }
  }

  // Effet pour re-rendre quand le code change
  useEffect(() => {
    const timeoutId = setTimeout(renderDiagram, 100)
    return () => clearTimeout(timeoutId)
  }, [renderDiagram])

  // Fonctions d'export
  const handleExportSVG = async () => {
    if (!containerRef.current) return
    
    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) {
      toast({
        title: "Erreur d'export",
        description: "Aucun diagramme à exporter",
        variant: "destructive"
      })
      return
    }
    
    setIsExporting(true)
    try {
      const result = await exportSVG(svgElement)
      if (result.success && result.data instanceof Blob) {
        const filename = generateFilename(diagramType, 'svg')
        downloadFile(result.data, filename)
        toast({
          title: "Export réussi",
          description: `Diagramme exporté en ${filename}`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erreur d'export SVG",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPNG = async () => {
    if (!containerRef.current) return
    
    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) {
      toast({
        title: "Erreur d'export",
        description: "Aucun diagramme à exporter",
        variant: "destructive"
      })
      return
    }
    
    setIsExporting(true)
    try {
      const result = await exportPNG(svgElement, { 
        width: 1200, 
        height: 800, 
        backgroundColor: '#ffffff' 
      })
      if (result.success && result.data instanceof Blob) {
        const filename = generateFilename(diagramType, 'png')
        downloadFile(result.data, filename)
        toast({
          title: "Export réussi",
          description: `Diagramme exporté en ${filename}`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erreur d'export PNG",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopySVG = async () => {
    if (!containerRef.current) return
    
    const svgElement = containerRef.current.querySelector('svg')
    if (!svgElement) {
      toast({
        title: "Erreur de copie",
        description: "Aucun diagramme à copier",
        variant: "destructive"
      })
      return
    }
    
    try {
      const result = await copySVGToClipboard(svgElement)
      if (result.success) {
        toast({
          title: "Copié !",
          description: "Le code SVG a été copié dans le presse-papiers"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre d'outils */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={renderDiagram}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Rendu...' : 'Actualiser'}
          </Button>
          
          {!error && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySVG}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier SVG
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSVG}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export SVG
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPNG}
                disabled={isExporting}
                className="gap-2"
              >
                <FileImage className="h-4 w-4" />
                Export PNG
              </Button>
            </>
          )}
        </div>
        
        {error && (
          <div className="text-sm text-muted-foreground">
            {error.line && `Ligne ${error.line}`}
          </div>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <strong>{error.message}</strong>
              {error.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Détails techniques</summary>
                  <pre className="text-xs mt-1 p-2 bg-red-50 rounded overflow-x-auto">
                    {error.details}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Conteneur du diagramme */}
      <div
        ref={containerRef}
        className="min-h-[400px] border rounded-lg p-4 bg-white overflow-auto"
        style={{
          minHeight: height ? `${height}px` : '400px',
          maxWidth: '100%'
        }}
      />
    </div>
  )
}
