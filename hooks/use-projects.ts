"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface Project {
  id: string
  title: string
  client?: string
  lead?: string
  language: string
  committee?: string
  style?: string
  status: string
  methodologies?: string[]
  ragOptions?: {
    chunkSize?: number
    overlap?: number
    topK?: number
  }
  createdAt: string
  updatedAt: string
  documents: Array<{
    id: string
    name: string
    mime: string
    pages?: number
    size?: number
    status: string
    createdAt: string
  }>
  chunks: Array<{
    id: string
    text: string
    page: number
    document: {
      name: string
    }
  }>
  citations: Array<{
    id: string
    snippet: string
    section: string
    page: number
    document: {
      name: string
    }
  }>
  diagrams: Array<{
    id: string
    kind: string
    title: string
    mermaid: string
    createdAt: string
  }>
  tables: Array<{
    id: string
    name: string
    csv: string
    createdAt: string
  }>
  report?: {
    id: string
    markdown: string
    pdfPath?: string
    createdAt: string
    updatedAt: string
  }
  _count: {
    documents: number
    chunks: number
    diagrams: number
  }
}

export interface CreateProjectData {
  title: string
  client: string
  lead: string
  language: string
  committee: string
  style: string
  methodologies: string[]
  ragOptions: {
    chunkSize: number
    overlap: number
    topK: number
  }
}

// API functions with timeout
const DEFAULT_TIMEOUT = 12000 // 12 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé. Veuillez réessayer.')
    }
    throw error
  }
}

async function fetchProjects(): Promise<Project[]> {
  const response = await fetchWithTimeout('/api/projects')
  return response.json()
}

async function fetchProject(id: string): Promise<Project> {
  const response = await fetchWithTimeout(`/api/projects/${id}`)
  return response.json()
}

async function createProject(data: CreateProjectData): Promise<Project> {
  const response = await fetchWithTimeout('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.json()
}

async function deleteProject(id: string): Promise<void> {
  await fetchWithTimeout(`/api/projects/${id}`, {
    method: 'DELETE',
  })
}

async function processProject(id: string, step: 'ingest' | 'embed' | 'generate'): Promise<void> {
  const timeout = step === 'generate' ? 300000 : DEFAULT_TIMEOUT // 5 minutes for generate
  await fetchWithTimeout(`/api/projects/${id}/${step}`, {
    method: 'POST',
  }, timeout)
}

// Custom hooks
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({
        title: "Projet créé",
        description: "Le projet a été créé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
        variant: "destructive",
      })
    },
  })
}

export function useProcessProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, step }: { id: string, step: 'ingest' | 'embed' | 'generate' }) => 
      processProject(id, step),
    onSuccess: (_, { id, step }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      const stepLabels = {
        ingest: 'Ingestion',
        embed: 'Génération des embeddings',
        generate: 'Génération du rapport'
      }
      
      toast({
        title: "Étape terminée",
        description: `${stepLabels[step]} terminée avec succès`,
      })
    },
    onError: (error: Error, { step }) => {
      const stepLabels = {
        ingest: 'ingestion',
        embed: 'génération des embeddings',
        generate: 'génération du rapport'
      }
      
      toast({
        title: "Erreur de traitement",
        description: error.message || `Erreur lors de l'${stepLabels[step]}`,
        variant: "destructive",
      })
    },
  })
}
