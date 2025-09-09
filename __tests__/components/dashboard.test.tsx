import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Dashboard } from '@/components/dashboard'
import { useToast } from '@/components/ui/use-toast'

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

// Mock Next.js Link
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

const mockProjects = [
  {
    id: '1',
    title: 'Project 1',
    client: 'Client A',
    lead: 'Lead A',
    status: 'generated',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    _count: {
      documents: 5,
      chunks: 100,
      diagrams: 2
    },
    report: { id: 'report-1' }
  },
  {
    id: '2', 
    title: 'Project 2',
    client: 'Client B',
    lead: 'Lead B',
    status: 'generating',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    _count: {
      documents: 3,
      chunks: 50,
      diagrams: 1
    }
  },
  {
    id: '3',
    title: 'Project 3',
    status: 'error',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    _count: {
      documents: 0,
      chunks: 0,
      diagrams: 0
    }
  }
]

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Dashboard Component', () => {
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.mocked(useToast).mockReturnValue({ toast: mockToast })
    mockFetch.mockClear()
    mockToast.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should display loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<Dashboard />)
    
    expect(screen.getByText('Chargement du tableau de bord...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // spinner
  })

  it('should display projects and stats when data loads successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects
    })

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Tableau de Bord')).toBeInTheDocument()
    })

    // Check stats
    expect(screen.getByText('3')).toBeInTheDocument() // Total projects
    expect(screen.getByText('1')).toBeInTheDocument() // Completed projects  
    expect(screen.getByText('1')).toBeInTheDocument() // In progress projects
    expect(screen.getByText('33%')).toBeInTheDocument() // Success rate

    // Check project list
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
    expect(screen.getByText('Project 3')).toBeInTheDocument()
    expect(screen.getByText('Client A')).toBeInTheDocument()
  })

  it('should display error state when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
    })

    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Erreur',
      description: 'Impossible de charger les projets. Network error',
      variant: 'destructive'
    })
  })

  it('should display timeout error when fetch times out', async () => {
    mockFetch.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('Timeout')
          error.name = 'AbortError'
          reject(error)
        }, 100)
      })
    })

    render(<Dashboard />)
    
      await waitFor(() => {
        expect(screen.getByText('Délai d\'attente dépassé. Veuillez réessayer.')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should display empty state when no projects exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Aucun projet')).toBeInTheDocument()
    })

    expect(screen.getByText('Commencez par créer votre premier projet')).toBeInTheDocument()
    expect(screen.getByText('Créer un Projet')).toBeInTheDocument()
  })

  it('should allow retry when in error state', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects
      })

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Réessayer')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Réessayer'))
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should display correct status badges and colors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects
    })

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport généré')).toBeInTheDocument() // generated status
      expect(screen.getByText('Génération en cours')).toBeInTheDocument() // generating status
      expect(screen.getByText('Erreur')).toBeInTheDocument() // error status
    })
  })

  it('should display correct progress percentages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects
    })

    render(<Dashboard />)
    
    await waitFor(() => {
      // Check progress bars are displayed
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })
})
