import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LibraryPage from '@/app/library/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null)
  }),
  usePathname: () => '/library'
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Library Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    renderWithQuery(<LibraryPage />)
    
    expect(screen.getByText('Bibliothèque Documentaire')).toBeInTheDocument()
    expect(screen.getByText('Gérez tous vos documents traités et analysés par l\'IA')).toBeInTheDocument()
  })

  it('should display documents when data loads successfully', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    expect(screen.getByText('Analyse Sécurité.docx')).toBeInTheDocument()
    expect(screen.getByText('Données Métier.xlsx')).toBeInTheDocument()
  })

  it('should display document details correctly', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    // Check status badges
    expect(screen.getAllByText('Traité')).toHaveLength(2)
    expect(screen.getByText('En attente')).toBeInTheDocument()

    // Check tags
    expect(screen.getByText('architecture')).toBeInTheDocument()
    expect(screen.getByText('technique')).toBeInTheDocument()
    expect(screen.getByText('sécurité')).toBeInTheDocument()
  })

  it('should filter documents by search term', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou tags...')
    fireEvent.change(searchInput, { target: { value: 'Sécurité' } })
    
    await waitFor(() => {
      expect(screen.getByText('Analyse Sécurité.docx')).toBeInTheDocument()
      expect(screen.queryByText('Rapport Architecture.pdf')).not.toBeInTheDocument()
    })
  })

  it('should filter documents by type', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    // Open type filter dropdown (look for the filter trigger)
    const typeFilters = screen.getAllByText('Tous les types')
    fireEvent.click(typeFilters[0])
    
    // Select PDF filter
    const pdfOption = screen.getByText('PDF')
    fireEvent.click(pdfOption)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
      expect(screen.queryByText('Analyse Sécurité.docx')).not.toBeInTheDocument()
    })
  })

  it('should filter documents by status', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    // Open status filter dropdown
    const statusFilters = screen.getAllByText('Tous les statuts')
    fireEvent.click(statusFilters[0])
    
    // Select processed filter
    const processedOption = screen.getByText('Traité')
    fireEvent.click(processedOption)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
      expect(screen.getByText('Analyse Sécurité.docx')).toBeInTheDocument()
      expect(screen.queryByText('Données Métier.xlsx')).not.toBeInTheDocument()
    })
  })

  it('should display search empty state when no results match', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou tags...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentDocument' } })
    
    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
      expect(screen.getByText(/NonExistentDocument/)).toBeInTheDocument()
      expect(screen.getByText('Effacer la recherche')).toBeInTheDocument()
    })
  })

  it('should clear search filter', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher par nom ou tags...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentDocument' } })
    
    await waitFor(() => {
      expect(screen.getByText('Effacer la recherche')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Effacer la recherche')
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })
  })

  it('should display statistics correctly', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    // Check statistics
    expect(screen.getByText('3')).toBeInTheDocument() // Total documents
    expect(screen.getByText('2')).toBeInTheDocument() // Processed documents  
    expect(screen.getByText('1')).toBeInTheDocument() // Pending documents
    expect(screen.getByText('3MB')).toBeInTheDocument() // Space used (approximate)
  })

  it('should handle document actions', async () => {
    renderWithQuery(<LibraryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Rapport Architecture.pdf')).toBeInTheDocument()
    })

    // Check action buttons are present
    expect(screen.getAllByText('Télécharger')).toHaveLength(3)
    expect(screen.getAllByText('Voir')).toHaveLength(3)
    expect(screen.getAllByText('Supprimer')).toHaveLength(3)
  })

  it('should handle create document action', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    renderWithQuery(<LibraryPage />)
    
    const addButton = screen.getByText('Ajouter Document')
    fireEvent.click(addButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Create document clicked')
    consoleSpy.mockRestore()
  })
})
