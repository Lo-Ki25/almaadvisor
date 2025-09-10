import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schéma de validation pour les requêtes d'export
const exportRequestSchema = z.object({
  code: z.string().min(1, 'Le code Mermaid est requis').max(50000, 'Le code est trop long'),
  format: z.enum(['svg', 'png'], { 
    errorMap: () => ({ message: 'Format non supporté. Utilisez svg ou png' })
  }),
  options: z.object({
    width: z.number().int().min(100).max(5000).optional().default(1200),
    height: z.number().int().min(100).max(5000).optional().default(800),
    backgroundColor: z.string().optional().default('#ffffff'),
    theme: z.enum(['default', 'dark', 'forest', 'base', 'neutral']).optional().default('default')
  }).optional().default({})
})

type ExportRequest = z.infer<typeof exportRequestSchema>

/**
 * API Route pour l'export côté serveur de diagrammes Mermaid
 * 
 * Cette route utilise le rendu côté serveur pour générer des diagrammes
 * de haute qualité. Elle est utile pour les exports batch ou quand
 * le rendu côté client n'est pas suffisant.
 * 
 * POST /api/mermaid/export
 * Body: { code: string, format: 'svg'|'png', options?: {...} }
 * 
 * Note: Cette implémentation utilise une approche de rendu côté serveur
 * avec puppeteer/playwright pour la génération PNG. Pour l'instant,
 * nous retournons une erreur indiquant que cette fonctionnalité
 * nécessite une configuration serveur spécifique.
 */
export async function POST(request: NextRequest) {
  try {
    // Parser et valider les données de la requête
    const body = await request.json()
    const validatedData = exportRequestSchema.parse(body)
    
    const { code, format, options } = validatedData

    // Pour l'export SVG, nous pouvons utiliser Mermaid côté serveur
    if (format === 'svg') {
      return await exportSVGServerSide(code, options || {})
    }
    
    // Pour l'export PNG, une configuration serveur spécifique est nécessaire
    if (format === 'png') {
      return await exportPNGServerSide(code, options || {})
    }

  } catch (error) {
    console.error('Erreur dans l\'export Mermaid:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données de requête invalides',
          details: error.errors 
        }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur lors de l\'export',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

/**
 * Export SVG côté serveur
 * Utilise Mermaid en mode serveur pour générer le SVG
 */
async function exportSVGServerSide(code: string, options: any) {
  try {
    // Import dynamique de Mermaid pour éviter les problèmes SSR
    const mermaid = await import('mermaid')
    
    // Configuration pour le rendu serveur
    mermaid.default.initialize({
      startOnLoad: false,
      theme: options.theme || 'default',
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
        background: options.backgroundColor || '#ffffff'
      },
      flowchart: {
        htmlLabels: false, // Important pour le rendu serveur
        useMaxWidth: true,
      },
      securityLevel: 'strict',
    })
    
    // Générer un ID unique
    const diagramId = `server-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Valider et rendre le diagramme
    const isValid = await mermaid.default.parse(code)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Code Mermaid invalide' }, 
        { status: 400 }
      )
    }
    
    const { svg } = await mermaid.default.render(diagramId, code)
    
    // Appliquer les dimensions si spécifiées
    let processedSvg = svg
    if (options.width || options.height) {
      processedSvg = applySvgDimensions(svg, options.width, options.height)
    }
    
    // Retourner le SVG
    return new NextResponse(processedSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="diagram-${diagramId}.svg"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de l\'export SVG:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération SVG',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

/**
 * Export PNG côté serveur
 * Nécessite Puppeteer ou Playwright pour le rendu en PNG
 * 
 * Note: Cette fonctionnalité nécessite une configuration serveur spécifique
 * avec des dépendances supplémentaires non incluses par défaut.
 */
async function exportPNGServerSide(code: string, options: any) {
  // Pour l'instant, nous retournons une erreur indiquant que cette fonctionnalité
  // nécessite une configuration spécifique
  return NextResponse.json(
    { 
      success: false, 
      error: 'Export PNG côté serveur non configuré',
      details: 'Cette fonctionnalité nécessite l\'installation de Puppeteer ou Playwright. Utilisez l\'export côté client pour les PNG.',
      recommendation: 'Utilisez l\'export côté client via le composant MermaidPreview pour générer des PNG.'
    }, 
    { status: 501 } // Not Implemented
  )
  
  // Implémentation future avec Puppeteer:
  /*
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({ headless: true })
    const page = await browser.newPage()
    
    // Définir la taille de la page
    await page.setViewport({ 
      width: options.width || 1200, 
      height: options.height || 800 
    })
    
    // HTML template avec Mermaid
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
        <style>
          body { margin: 0; padding: 20px; background: ${options.backgroundColor || '#ffffff'}; }
          .mermaid { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 40px); }
        </style>
      </head>
      <body>
        <div class="mermaid">${code}</div>
        <script>
          mermaid.initialize({ theme: '${options.theme || 'default'}' });
        </script>
      </body>
      </html>
    `
    
    await page.setContent(html)
    await page.waitForSelector('.mermaid svg', { timeout: 10000 })
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false
    })
    
    await browser.close()
    
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="diagram-${Date.now()}.png"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de l\'export PNG:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération PNG' }, 
      { status: 500 }
    )
  }
  */
}

/**
 * Applique les dimensions spécifiées au SVG
 */
function applySvgDimensions(svg: string, width?: number, height?: number): string {
  let processedSvg = svg
  
  if (width) {
    processedSvg = processedSvg.replace(/width="[^"]*"/, `width="${width}"`)
  }
  
  if (height) {
    processedSvg = processedSvg.replace(/height="[^"]*"/, `height="${height}"`)
  }
  
  return processedSvg
}

/**
 * GET endpoint pour récupérer les informations sur l'API
 */
export async function GET() {
  return NextResponse.json({
    name: 'Mermaid Export API',
    version: '1.0.0',
    description: 'API pour l\'export de diagrammes Mermaid en SVG et PNG',
    endpoints: {
      'POST /api/mermaid/export': {
        description: 'Exporte un diagramme Mermaid',
        body: {
          code: 'string (requis) - Code Mermaid',
          format: 'svg|png (requis) - Format d\'export',
          options: {
            width: 'number (optionnel) - Largeur en pixels',
            height: 'number (optionnel) - Hauteur en pixels', 
            backgroundColor: 'string (optionnel) - Couleur de fond',
            theme: 'string (optionnel) - Thème Mermaid'
          }
        }
      }
    },
    status: {
      svg_export: 'disponible',
      png_export: 'nécessite configuration serveur (Puppeteer/Playwright)'
    }
  })
}
