// Utilitaires d'export pour les diagrammes Mermaid
export interface ExportOptions {
  filename?: string
  width?: number
  height?: number
  backgroundColor?: string
  scale?: number
}

export interface ExportResult {
  success: boolean
  error?: string
  data?: string | Blob
}

/**
 * Exporte un diagramme SVG depuis un élément DOM
 */
export async function exportSVG(
  svgElement: SVGElement,
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    // Cloner l'élément SVG pour éviter les modifications
    const clonedSvg = svgElement.cloneNode(true) as SVGElement
    
    // Appliquer les options
    if (options.width) clonedSvg.setAttribute('width', options.width.toString())
    if (options.height) clonedSvg.setAttribute('height', options.height.toString())
    if (options.backgroundColor) {
      clonedSvg.style.backgroundColor = options.backgroundColor
    }
    
    // Sérialiser le SVG
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSvg)
    
    // Créer le blob
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    
    return {
      success: true,
      data: blob
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur lors de l'export SVG: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

/**
 * Exporte un diagramme PNG depuis un élément SVG
 */
export async function exportPNG(
  svgElement: SVGElement,
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    const { width = 1200, height = 800, backgroundColor = '#ffffff', scale = 2 } = options
    
    // Créer un canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Impossible de créer le contexte canvas')
    }
    
    // Configurer la taille du canvas avec la mise à l'échelle
    canvas.width = width * scale
    canvas.height = height * scale
    
    // Mettre à l'échelle le contexte
    ctx.scale(scale, scale)
    
    // Appliquer le fond
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    
    // Cloner et préparer le SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGElement
    clonedSvg.setAttribute('width', width.toString())
    clonedSvg.setAttribute('height', height.toString())
    
    // Convertir le SVG en string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSvg)
    
    // Créer une image depuis le SVG
    const img = new Image()
    
    return new Promise<ExportResult>((resolve) => {
      img.onload = () => {
        try {
          // Dessiner l'image sur le canvas
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convertir le canvas en blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve({
                success: true,
                data: blob
              })
            } else {
              resolve({
                success: false,
                error: 'Impossible de créer le blob PNG'
              })
            }
          }, 'image/png', 0.95)
        } catch (error) {
          resolve({
            success: false,
            error: `Erreur lors du rendu PNG: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          })
        }
      }
      
      img.onerror = () => {
        resolve({
          success: false,
          error: 'Erreur lors du chargement de l\'image SVG'
        })
      }
      
      // Charger le SVG comme data URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      img.src = url
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  } catch (error) {
    return {
      success: false,
      error: `Erreur lors de l'export PNG: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

/**
 * Déclenche le téléchargement d'un fichier
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copie le contenu SVG dans le presse-papiers
 */
export async function copySVGToClipboard(svgElement: SVGElement): Promise<ExportResult> {
  try {
    if (!navigator.clipboard) {
      throw new Error('API Clipboard non disponible')
    }
    
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    
    await navigator.clipboard.writeText(svgString)
    
    return {
      success: true,
      data: svgString
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur lors de la copie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

/**
 * Génère un nom de fichier automatique pour l'export
 */
export function generateFilename(diagramType: string, format: 'svg' | 'png'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  return `diagram-${diagramType}-${timestamp}.${format}`
}

/**
 * Optimise un SVG pour l'export (nettoie les attributs inutiles)
 */
export function optimizeSVG(svgElement: SVGElement): SVGElement {
  const cloned = svgElement.cloneNode(true) as SVGElement
  
  // Supprimer les attributs de style inline inutiles
  const elements = cloned.querySelectorAll('*')
  elements.forEach(el => {
    // Garder seulement les attributs essentiels
    const keepAttributes = ['class', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'viewBox']
    const attrs = Array.from(el.attributes)
    attrs.forEach(attr => {
      if (!keepAttributes.includes(attr.name) && !attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name)
      }
    })
  })
  
  return cloned
}
