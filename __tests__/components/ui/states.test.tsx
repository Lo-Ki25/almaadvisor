import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  ErrorState, 
  EmptyState, 
  SearchEmptyState,
  NetworkErrorState,
  TimeoutErrorState,
  ProjectCardSkeleton
} from '@/components/ui/states'
import { Brain, Plus } from 'lucide-react'

describe('State Components', () => {
  describe('ErrorState', () => {
    it('should render error message and retry button', () => {
      const mockRetry = vi.fn()
      render(
        <ErrorState
          title="Test Error"
          message="Something went wrong"
          retry={mockRetry}
        />
      )

      expect(screen.getByText('Test Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Réessayer')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Réessayer'))
      expect(mockRetry).toHaveBeenCalledOnce()
    })

    it('should hide retry button when showRetry is false', () => {
      render(
        <ErrorState
          title="Test Error"
          message="Something went wrong"
          showRetry={false}
        />
      )

      expect(screen.queryByText('Réessayer')).not.toBeInTheDocument()
    })
  })

  describe('NetworkErrorState', () => {
    it('should render network error with offline indicator', () => {
      const mockRetry = vi.fn()
      render(<NetworkErrorState retry={mockRetry} />)

      expect(screen.getByText('Problème de connexion')).toBeInTheDocument()
      expect(screen.getByText('Vérifiez votre connexion internet et réessayez')).toBeInTheDocument()
      expect(screen.getByText('Hors ligne')).toBeInTheDocument()
    })
  })

  describe('TimeoutErrorState', () => {
    it('should render timeout error message', () => {
      const mockRetry = vi.fn()
      render(<TimeoutErrorState retry={mockRetry} />)

      expect(screen.getByText('Délai d\'attente dépassé')).toBeInTheDocument()
      expect(screen.getByText('L\'opération a pris trop de temps. Veuillez réessayer.')).toBeInTheDocument()
    })
  })

  describe('EmptyState', () => {
    it('should render empty state with action button', () => {
      const mockAction = vi.fn()
      render(
        <EmptyState
          icon={Brain}
          title="No Projects"
          description="Create your first project to get started"
          action={{
            label: "Create Project",
            onClick: mockAction,
            icon: Plus
          }}
        />
      )

      expect(screen.getByText('No Projects')).toBeInTheDocument()
      expect(screen.getByText('Create your first project to get started')).toBeInTheDocument()
      
      const button = screen.getByText('Create Project')
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(mockAction).toHaveBeenCalledOnce()
    })

    it('should render without action button', () => {
      render(
        <EmptyState
          icon={Brain}
          title="No Projects"
          description="Create your first project to get started"
        />
      )

      expect(screen.getByText('No Projects')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('SearchEmptyState', () => {
    it('should render search empty state with clear button', () => {
      const mockOnClear = vi.fn()
      render(
        <SearchEmptyState
          searchTerm="test query"
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
      expect(screen.getByText(/test query/)).toBeInTheDocument()
      
      const clearButton = screen.getByText('Effacer la recherche')
      expect(clearButton).toBeInTheDocument()
      
      fireEvent.click(clearButton)
      expect(mockOnClear).toHaveBeenCalledOnce()
    })
  })

  describe('ProjectCardSkeleton', () => {
    it('should render skeleton elements', () => {
      const { container } = render(<ProjectCardSkeleton />)
      
      // Check that skeleton elements are rendered
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })
})
