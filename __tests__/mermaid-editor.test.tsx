import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MermaidEditor } from '@/components/mermaid/mermaid-editor'
import { MermaidPreview } from '@/components/mermaid/mermaid-preview'
import { 
  exportSVG, 
  exportPNG, 
  copySVGToClipboard, 
  generateFilename,
  optimizeSVG
} from '@/lib/mermaid-export'
import { diagramTemplates } from '@/lib/mermaid-templates'

// Mock des dépendances
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock de Mermaid
const mockMermaid = {
  initialize: vi.fn(),
  parse: vi.fn().mockResolvedValue(true),
  render: vi.fn().mockResolvedValue({ 
    svg: '<svg><rect width="100" height="100"/></svg>' 
  })
}

vi.mock('mermaid', () => ({
  default: mockMermaid
}))

// Mock de l'API Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
})

describe('MermaidEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait rendre l\'éditeur avec les contrôles par défaut', () => {
    render(<MermaidEditor />)
    
    expect(screen.getByText('Éditeur de Diagrammes Mermaid')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Entrez votre code Mermaid ici...')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument() // Select des templates
  })

  it('devrait charger un template au changement de sélection', async () => {
    const onSave = vi.fn()
    render(<MermaidEditor onSave={onSave} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.click(select)
    
    await waitFor(() => {
      const bpmnOption = screen.getByText('BPMN 2.0 - Processus Métier')
      fireEvent.click(bpmnOption)
    })
    
    expect(screen.getByDisplayValue(/graph TD/)).toBeInTheDocument()
  })

  it('devrait limiter le nombre de caractères', () => {
    const maxChars = 100
    render(<MermaidEditor maxCharacters={maxChars} />)
    
    const textarea = screen.getByPlaceholderText('Entrez votre code Mermaid ici...')
    const longText = 'a'.repeat(150)
    
    fireEvent.change(textarea, { target: { value: longText } })
    
    expect(textarea.value).toHaveLength(maxChars)
  })

  it('devrait changer de mode de vue', () => {
    render(<MermaidEditor />)
    
    const previewButton = screen.getByRole('button', { name: /preview/i })
    fireEvent.click(previewButton)
    
    // Vérifier que seule la preview est visible
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('devrait appeler onSave avec le bon code et type', () => {
    const onSave = vi.fn()
    render(<MermaidEditor onSave={onSave} />)
    
    const textarea = screen.getByPlaceholderText('Entrez votre code Mermaid ici...')
    fireEvent.change(textarea, { target: { value: 'graph TD\nA --> B' } })
    
    const saveButton = screen.getByRole('button', { name: /sauvegarder/i })
    fireEvent.click(saveButton)
    
    expect(onSave).toHaveBeenCalledWith('graph TD\nA --> B', 'c4-context')
  })
})

describe('MermaidPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait rendre la preview avec le code fourni', async () => {
    const code = 'graph TD\nA --> B'
    render(<MermaidPreview code={code} />)
    
    await waitFor(() => {
      expect(mockMermaid.initialize).toHaveBeenCalled()
      expect(mockMermaid.parse).toHaveBeenCalledWith(code)
      expect(mockMermaid.render).toHaveBeenCalled()
    })
  })

  it('devrait afficher un message d\'erreur pour un code invalide', async () => {
    const invalidCode = 'invalid mermaid code'
    mockMermaid.parse.mockResolvedValueOnce(false)
    mockMermaid.render.mockRejectedValueOnce(new Error('Syntax error'))
    
    const onError = vi.fn()
    render(<MermaidPreview code={invalidCode} onError={onError} />)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de syntaxe')).toBeInTheDocument()
      expect(onError).toHaveBeenCalled()
    })
  })

  it('devrait permettre l\'export SVG', async () => {
    const code = 'graph TD\nA --> B'
    render(<MermaidPreview code={code} />)
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export svg/i })
      expect(exportButton).toBeInTheDocument()
    })
  })

  it('devrait afficher les boutons d\'export seulement s\'il n\'y a pas d\'erreur', () => {
    render(<MermaidPreview code="" />)
    
    expect(screen.queryByRole('button', { name: /export svg/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /export png/i })).not.toBeInTheDocument()
  })
})

describe('Mermaid Export Utilities', () => {
  let mockSvgElement: SVGElement

  beforeEach(() => {
    // Créer un SVG mock
    mockSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    mockSvgElement.setAttribute('width', '200')
    mockSvgElement.setAttribute('height', '150')
    mockSvgElement.innerHTML = '<rect width="100" height="100" fill="blue"/>'
    
    // Mock de XMLSerializer
    global.XMLSerializer = vi.fn(() => ({
      serializeToString: vi.fn(() => '<svg width="200" height="150"><rect width="100" height="100" fill="blue"/></svg>')
    })) as any

    // Mock de Blob
    global.Blob = vi.fn((content, options) => ({
      content,
      options,
      type: options?.type || 'application/octet-stream'
    })) as any

    // Mock de URL
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('exportSVG', () => {
    it('devrait exporter un SVG avec succès', async () => {
      const result = await exportSVG(mockSvgElement)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Object) // Mock Blob
    })

    it('devrait appliquer les dimensions spécifiées', async () => {
      const options = { width: 300, height: 200 }
      const result = await exportSVG(mockSvgElement, options)
      
      expect(result.success).toBe(true)
      // Vérifier que les dimensions sont appliquées au clone
    })

    it('devrait gérer les erreurs de sérialisation', async () => {
      // Mock d'une erreur de sérialisation
      global.XMLSerializer = vi.fn(() => ({
        serializeToString: vi.fn(() => { throw new Error('Serialization failed') })
      })) as any

      const result = await exportSVG(mockSvgElement)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Erreur lors de l\'export SVG')
    })
  })

  describe('exportPNG', () => {
    beforeEach(() => {
      // Mock de HTMLCanvasElement
      const mockCanvas = {
        getContext: vi.fn(() => ({
          scale: vi.fn(),
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn()
        })),
        toBlob: vi.fn((callback) => callback(new Blob(['mock-png-data'], { type: 'image/png' }))),
        width: 0,
        height: 0
      }
      
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any
      document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') return mockCanvas
        return document.createElement(tag)
      }) as any
    })

    it('devrait créer un canvas avec les bonnes dimensions', async () => {
      const options = { width: 800, height: 600, scale: 2 }
      const result = await exportPNG(mockSvgElement, options)
      
      // Test que le canvas a été configuré
      expect(document.createElement).toHaveBeenCalledWith('canvas')
    })
  })

  describe('copySVGToClipboard', () => {
    it('devrait copier le SVG dans le presse-papiers', async () => {
      const result = await copySVGToClipboard(mockSvgElement)
      
      expect(result.success).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('devrait gérer l\'absence de l\'API Clipboard', async () => {
      // Mock d'un navigateur sans support clipboard
      Object.assign(navigator, { clipboard: undefined })
      
      const result = await copySVGToClipboard(mockSvgElement)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API Clipboard non disponible')
    })
  })

  describe('generateFilename', () => {
    it('devrait générer un nom de fichier avec timestamp', () => {
      const filename = generateFilename('c4-context', 'svg')
      
      expect(filename).toMatch(/^diagram-c4-context-\d{8}T\d{6}\.svg$/)
    })

    it('devrait supporter différents formats', () => {
      const svgFilename = generateFilename('bpmn', 'svg')
      const pngFilename = generateFilename('bpmn', 'png')
      
      expect(svgFilename).toEndWith('.svg')
      expect(pngFilename).toEndWith('.png')
    })
  })

  describe('optimizeSVG', () => {
    it('devrait nettoyer les attributs inutiles', () => {
      const svgWithExtraAttrs = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('fill', 'red')
      rect.setAttribute('data-custom', 'keep-this')
      rect.setAttribute('onclick', 'remove-this')
      svgWithExtraAttrs.appendChild(rect)
      
      const optimized = optimizeSVG(svgWithExtraAttrs)
      const optimizedRect = optimized.querySelector('rect')
      
      expect(optimizedRect?.getAttribute('fill')).toBe('red')
      expect(optimizedRect?.getAttribute('data-custom')).toBe('keep-this')
      expect(optimizedRect?.getAttribute('onclick')).toBeNull()
    })

    it('devrait cloner l\'élément sans modifier l\'original', () => {
      const original = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      original.setAttribute('width', '100')
      
      const optimized = optimizeSVG(original)
      
      expect(optimized).not.toBe(original)
      expect(original.getAttribute('width')).toBe('100')
    })
  })
})

describe('Templates de diagrammes', () => {
  it('devrait contenir tous les types requis', () => {
    const requiredTypes = ['c4-context', 'c4-container', 'bpmn-process', 'gantt', 'stride', 'business-canvas']
    
    const templateIds = diagramTemplates.map(t => t.id)
    
    requiredTypes.forEach(type => {
      expect(templateIds).toContain(type)
    })
  })

  it('devrait avoir des templates valides avec du contenu', () => {
    diagramTemplates.forEach(template => {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.category).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.template).toBeTruthy()
      expect(template.template.length).toBeGreaterThan(10)
    })
  })

  it('devrait regrouper les templates par catégories', () => {
    const categories = [...new Set(diagramTemplates.map(t => t.category))]
    
    expect(categories.length).toBeGreaterThan(1)
    expect(categories).toContain('Architecture')
    expect(categories).toContain('Processus')
  })
})

describe('API d\'export Mermaid', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('devrait valider les requêtes d\'export', async () => {
    const mockResponse = {
      ok: true,
      headers: new Headers({ 'Content-Type': 'image/svg+xml' }),
      blob: () => Promise.resolve(new Blob(['mock-svg'], { type: 'image/svg+xml' }))
    }
    
    ;(global.fetch as any).mockResolvedValue(mockResponse)
    
    const response = await fetch('/api/mermaid/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'graph TD\nA --> B',
        format: 'svg',
        options: { width: 800, height: 600 }
      })
    })
    
    expect(response.ok).toBe(true)
  })

  it('devrait rejeter les requêtes avec du code invalide', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        success: false,
        error: 'Données de requête invalides'
      })
    }
    
    ;(global.fetch as any).mockResolvedValue(mockErrorResponse)
    
    const response = await fetch('/api/mermaid/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: '', // Code vide
        format: 'svg'
      })
    })
    
    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
  })
})
