import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  DataState, 
  LibraryEmptyState, 
  AdminTableEmptyState, 
  DataSkeleton 
} from '@/components/ui/states'
import { Brain, Plus } from 'lucide-react'

describe('DataState Component', () => {
  const mockData = [{ id: '1', name: 'Test Item' }]
  const mockRetry = vi.fn()

  it('should render loading state', () => {
    render(
      <DataState
        data={[]}
        isLoading={true}
        error={null}
        loadingComponent={<div>Loading...</div>}
        emptyComponent={<div>Empty</div>}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render error state with retry', () => {
    const error = new Error('Some generic error')
    render(
      <DataState
        data={[]}
        isLoading={false}
        error={error}
        onRetry={mockRetry}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
    expect(screen.getByText('Impossible de charger les données. Réessayer.')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Réessayer')
    fireEvent.click(retryButton)
    expect(mockRetry).toHaveBeenCalled()
  })

  it('should render timeout error state', () => {
    const error = new Error('Délai d\'attente dépassé')
    render(
      <DataState
        data={[]}
        isLoading={false}
        error={error}
        onRetry={mockRetry}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('Délai d\'attente dépassé')).toBeInTheDocument()
  })

  it('should render network error state', () => {
    const error = new Error('NetworkError: Failed to fetch')
    render(
      <DataState
        data={[]}
        isLoading={false}
        error={error}
        onRetry={mockRetry}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('Problème de connexion')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    render(
      <DataState
        data={[]}
        isLoading={false}
        error={null}
        emptyComponent={<div>No items found</div>}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render data when available', () => {
    render(
      <DataState
        data={mockData}
        isLoading={false}
        error={null}
        emptyComponent={<div>Empty</div>}
      >
        {(data) => <div>Data: {data.length}</div>}
      </DataState>
    )

    expect(screen.getByText('Data: 1')).toBeInTheDocument()
  })
})

describe('LibraryEmptyState Component', () => {
  it('should render library empty state with action', () => {
    const mockCreate = vi.fn()
    render(<LibraryEmptyState onCreateDocument={mockCreate} />)

    expect(screen.getByText('Bibliothèque vide')).toBeInTheDocument()
    expect(screen.getByText(/Aucun document dans votre bibliothèque/)).toBeInTheDocument()
    
    const createButton = screen.getByText('Ajouter un document')
    expect(createButton).toBeInTheDocument()
    
    fireEvent.click(createButton)
    expect(mockCreate).toHaveBeenCalled()
  })

  it('should render library empty state without action', () => {
    render(<LibraryEmptyState />)

    expect(screen.getByText('Bibliothèque vide')).toBeInTheDocument()
    expect(screen.queryByText('Ajouter un document')).not.toBeInTheDocument()
  })
})

describe('AdminTableEmptyState Component', () => {
  it('should render admin table empty state with action', () => {
    const mockCreate = vi.fn()
    render(
      <AdminTableEmptyState 
        entityName="utilisateur" 
        onCreateEntity={mockCreate}
      />
    )

    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument()
    expect(screen.getByText(/Aucun utilisateur n'a été créé/)).toBeInTheDocument()
    
    const createButton = screen.getByText('Créer utilisateur')
    fireEvent.click(createButton)
    expect(mockCreate).toHaveBeenCalled()
  })
})

describe('DataSkeleton Component', () => {
  it('should render list skeleton by default', () => {
    const { container } = render(<DataSkeleton count={2} />)
    
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render grid skeleton', () => {
    const { container } = render(<DataSkeleton type="grid" count={2} />)
    
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })

  it('should render table skeleton', () => {
    const { container } = render(<DataSkeleton type="table" count={2} />)
    
    const table = container.querySelector('table')
    expect(table).toBeInTheDocument()
  })
})
