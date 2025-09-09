import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportsPage from '@/app/reports/page'

// Mock the hooks
vi.mock('@/hooks/use-projects', () => ({
  useProjects: vi.fn(),
  useDeleteProject: vi.fn()
}))

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
  usePathname: () => '/reports'
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

// Mock useToast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

import { useProjects, useDeleteProject } from '@/hooks/use-projects'

const mockProjects = [
  {
    id: '1',
    title: 'Digital Transformation Project',
    client: 'ACME Corp',
    lead: 'John Doe',
    status: 'generated',
    language: 'FR',
    methodologies: ['TOGAF', 'C4 Model'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T15:30:00Z',
    documents: [
      { id: 'doc1', name: 'architecture.pdf', mime: 'application/pdf', status: 'processed', createdAt: '2024-01-15T10:00:00Z' }
    ],
    chunks: [],
    citations: [],
    diagrams: [],
    tables: [],
    _count: { documents: 1, chunks: 25, diagrams: 3 },
    report: { id: 'report1', markdown: 'content', createdAt: '2024-01-15T15:30:00Z', updatedAt: '2024-01-15T15:30:00Z' }
  },
  {
    id: '2', 
    title: 'Security Audit',
    client: 'TechStart Inc',
    lead: 'Jane Smith',
    status: 'generating',
    language: 'EN',
    methodologies: ['OWASP', 'STRIDE'],
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    documents: [
      { id: 'doc2', name: 'security-policy.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', status: 'processed', createdAt: '2024-01-14T09:00:00Z' }
    ],
    chunks: [],
    citations: [],
    diagrams: [],
    tables: [],
    _count: { documents: 1, chunks: 15, diagrams: 1 }
  }
]

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

describe('Reports Page', () => {
  const mockMutate = vi.fn()
  
  beforeEach(() => {
    vi.mocked(useDeleteProject).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      data: undefined,
      isError: false,
      isIdle: true,
      isSuccess: false,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      isLoading: false,
      status: 'idle',
      submittedAt: 0,
      variables: undefined,
      context: undefined,
      mutateAsync: vi.fn(),
      reset: vi.fn()
    })
  })

  it('should display loading state initially', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: true,
      isPending: true,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'fetching',
      isInitialLoading: true,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: true,
      isSuccess: false,
      status: 'pending'
    })

    renderWithQuery(<ReportsPage />)
    
    expect(screen.getByText('Chargement des projets...')).toBeInTheDocument()
  })

  it('should display projects when data loads successfully', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    expect(screen.getByText('Digital Transformation Project')).toBeInTheDocument()
    expect(screen.getByText('Security Audit')).toBeInTheDocument()
    expect(screen.getByText('ACME Corp')).toBeInTheDocument()
    expect(screen.getByText('TechStart Inc')).toBeInTheDocument()
  })

  it('should display error state when fetch fails', () => {
    const mockRefetch = vi.fn()
    vi.mocked(useProjects).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      isError: true,
      refetch: mockRefetch,
      isFetching: false,
      isPending: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      failureCount: 1,
      failureReason: new Error('Network error'),
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: true,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: false,
      status: 'error'
    })

    renderWithQuery(<ReportsPage />)
    
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Réessayer')
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should display empty state when no projects exist', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    expect(screen.getByText('Aucun projet trouvé')).toBeInTheDocument()
    expect(screen.getByText('Commencez par créer votre premier projet')).toBeInTheDocument()
    expect(screen.getByText('Nouveau Projet')).toBeInTheDocument()
  })

  it('should filter projects by search term', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    const searchInput = screen.getByPlaceholderText('Rechercher par titre, client ou consultant...')
    fireEvent.change(searchInput, { target: { value: 'Security' } })
    
    expect(screen.getByText('Security Audit')).toBeInTheDocument()
    expect(screen.queryByText('Digital Transformation Project')).not.toBeInTheDocument()
  })

  it('should filter projects by status', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    const statusFilter = screen.getByDisplayValue('Tous les statuts')
    fireEvent.click(statusFilter)
    
    const generatedOption = screen.getByText('Généré')
    fireEvent.click(generatedOption)
    
    expect(screen.getByText('Digital Transformation Project')).toBeInTheDocument()
    expect(screen.queryByText('Security Audit')).not.toBeInTheDocument()
  })

  it('should display search empty state when no results match', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    const searchInput = screen.getByPlaceholderText('Rechercher par titre, client ou consultant...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentProject' } })
    
    expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
    expect(screen.getByText('NonExistentProject')).toBeInTheDocument()
    expect(screen.getByText('Effacer la recherche')).toBeInTheDocument()
  })

  it('should clear search filter', () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    const searchInput = screen.getByPlaceholderText('Rechercher par titre, client ou consultant...')
    fireEvent.change(searchInput, { target: { value: 'NonExistentProject' } })
    
    const clearButton = screen.getByText('Effacer la recherche')
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Digital Transformation Project')).toBeInTheDocument()
    expect(screen.getByText('Security Audit')).toBeInTheDocument()
  })

  it('should handle project deletion', async () => {
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
      isPending: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      status: 'success'
    })

    renderWithQuery(<ReportsPage />)
    
    const deleteButtons = screen.getAllByText('Supprimer')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('1')
    })
  })
})
