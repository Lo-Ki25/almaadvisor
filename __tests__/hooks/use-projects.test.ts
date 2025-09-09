import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProjects, type Project } from '@/hooks/use-projects'

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Test Project',
    client: 'Test Client',
    lead: 'Test Lead',
    language: 'FR',
    status: 'generated',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    documents: [],
    chunks: [],
    citations: [],
    diagrams: [],
    tables: [],
    _count: {
      documents: 0,
      chunks: 0,
      diagrams: 0,
    },
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch projects successfully', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    } as Response)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProjects)
    expect(result.current.error).toBe(null)
  })

  it('should handle fetch timeout', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockImplementationOnce(
      () => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AbortError')), 100)
      )
    )

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.error?.message).toContain('Délai d\'attente')
  })

  it('should handle HTTP errors', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.error?.message).toContain('HTTP 500')
  })
})
