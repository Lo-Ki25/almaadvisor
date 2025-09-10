"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Resource, ResourceAction, ResourceActionResult, ResourceEvent, ResourceStats } from '@/lib/types/resource'

interface ResourceStore {
  // État
  resources: Record<string, Resource>
  events: ResourceEvent[]
  favorites: Set<string>
  
  // Actions
  incrementDownload: (resourceId: string) => void
  incrementView: (resourceId: string) => void
  recordAction: (resourceId: string, action: ResourceAction, metadata?: Record<string, any>) => void
  toggleFavorite: (resourceId: string) => void
  updateResource: (resourceId: string, updates: Partial<Resource>) => void
  
  // Getters
  getResource: (resourceId: string) => Resource | undefined
  getResourceStats: (resourceId: string) => { downloads: number; views: number; isFavorite: boolean }
  getAllStats: () => ResourceStats
  getPopularResources: (limit?: number) => Resource[]
  getRecentResources: (limit?: number) => Resource[]
  isFavorite: (resourceId: string) => boolean
  
  // Utilitaires
  clearEvents: () => void
  exportStats: () => string
}

// Store Zustand avec persistance dans localStorage
export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      resources: {},
      events: [],
      favorites: new Set(),
      
      incrementDownload: (resourceId: string) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [resourceId]: {
              ...state.resources[resourceId],
              downloadCount: (state.resources[resourceId]?.downloadCount || 0) + 1
            }
          },
          events: [
            ...state.events,
            {
              id: generateEventId(),
              resourceId,
              action: 'download',
              timestamp: new Date().toISOString()
            }
          ]
        }))
      },
      
      incrementView: (resourceId: string) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [resourceId]: {
              ...state.resources[resourceId],
              viewCount: (state.resources[resourceId]?.viewCount || 0) + 1,
              lastViewedAt: new Date().toISOString()
            }
          },
          events: [
            ...state.events,
            {
              id: generateEventId(),
              resourceId,
              action: 'view',
              timestamp: new Date().toISOString()
            }
          ]
        }))
      },
      
      recordAction: (resourceId: string, action: ResourceAction, metadata?: Record<string, any>) => {
        set((state) => ({
          events: [
            ...state.events,
            {
              id: generateEventId(),
              resourceId,
              action,
              timestamp: new Date().toISOString(),
              metadata
            }
          ]
        }))
      },
      
      toggleFavorite: (resourceId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites)
          if (newFavorites.has(resourceId)) {
            newFavorites.delete(resourceId)
          } else {
            newFavorites.add(resourceId)
          }
          
          return {
            favorites: newFavorites,
            events: [
              ...state.events,
              {
                id: generateEventId(),
                resourceId,
                action: 'favorite',
                timestamp: new Date().toISOString(),
                metadata: { added: !state.favorites.has(resourceId) }
              }
            ]
          }
        })
      },
      
      updateResource: (resourceId: string, updates: Partial<Resource>) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [resourceId]: {
              ...state.resources[resourceId],
              ...updates
            }
          }
        }))
      },
      
      getResource: (resourceId: string) => {
        return get().resources[resourceId]
      },
      
      getResourceStats: (resourceId: string) => {
        const state = get()
        const resource = state.resources[resourceId]
        return {
          downloads: resource?.downloadCount || 0,
          views: resource?.viewCount || 0,
          isFavorite: state.favorites.has(resourceId)
        }
      },
      
      getAllStats: () => {
        const state = get()
        const resources = Object.values(state.resources)
        
        const totalDownloads = resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0)
        const totalViews = resources.reduce((sum, r) => sum + (r.viewCount || 0), 0)
        const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0)
        
        const byCategory: Record<string, number> = {}
        const byType: Record<string, number> = {}
        const byStatus: Record<string, number> = {}
        
        resources.forEach(resource => {
          byCategory[resource.category] = (byCategory[resource.category] || 0) + 1
          byType[resource.type] = (byType[resource.type] || 0) + 1
          byStatus[resource.status] = (byStatus[resource.status] || 0) + 1
        })
        
        return {
          totalResources: resources.length,
          totalSize,
          totalDownloads,
          totalViews,
          byCategory: byCategory as any,
          byType: byType as any,
          byStatus: byStatus as any,
          popularResources: get().getPopularResources(5),
          recentResources: get().getRecentResources(5)
        }
      },
      
      getPopularResources: (limit = 10) => {
        const resources = Object.values(get().resources)
        return resources
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, limit)
      },
      
      getRecentResources: (limit = 10) => {
        const resources = Object.values(get().resources)
        return resources
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
          .slice(0, limit)
      },
      
      isFavorite: (resourceId: string) => {
        return get().favorites.has(resourceId)
      },
      
      clearEvents: () => {
        set({ events: [] })
      },
      
      exportStats: () => {
        const state = get()
        const stats = get().getAllStats()
        
        return JSON.stringify({
          timestamp: new Date().toISOString(),
          stats,
          events: state.events.slice(-100), // Derniers 100 événements
          favorites: Array.from(state.favorites)
        }, null, 2)
      }
    }),
    {
      name: 'resource-store', // nom pour localStorage
      partialize: (state) => ({
        resources: state.resources,
        events: state.events.slice(-1000), // Garder seulement les 1000 derniers événements
        favorites: state.favorites
      }),
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          favorites: Array.from(state.favorites) // Convertir Set en Array pour JSON
        })
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        return {
          ...parsed,
          favorites: new Set(parsed.favorites || []) // Convertir Array en Set
        }
      }
    }
  )
)

// Hook pour les actions sur les ressources avec feedback
export const useResourceActions = () => {
  const store = useResourceStore()
  
  const handleDownload = async (resource: Resource): Promise<ResourceActionResult> => {
    try {
      // Simuler le téléchargement
      store.incrementDownload(resource.id)
      store.recordAction(resource.id, 'download', { 
        filename: resource.name,
        size: resource.size 
      })
      
      // Dans un vrai système, ici on déclencherait le téléchargement
      // window.open(`/api/resources/${resource.id}/download`)
      
      return {
        success: true,
        message: `Téléchargement de "${resource.title}" en cours...`
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du téléchargement: ${error}`
      }
    }
  }
  
  const handleView = async (resource: Resource): Promise<ResourceActionResult> => {
    try {
      store.incrementView(resource.id)
      store.recordAction(resource.id, 'view', {
        viewType: 'detail'
      })
      
      return {
        success: true,
        message: `Ouverture de "${resource.title}"`
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'ouverture: ${error}`
      }
    }
  }
  
  const handleFavorite = async (resource: Resource): Promise<ResourceActionResult> => {
    try {
      const wasFavorite = store.isFavorite(resource.id)
      store.toggleFavorite(resource.id)
      
      return {
        success: true,
        message: wasFavorite 
          ? `"${resource.title}" retiré des favoris`
          : `"${resource.title}" ajouté aux favoris`
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur: ${error}`
      }
    }
  }
  
  const handleShare = async (resource: Resource): Promise<ResourceActionResult> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.origin + `/library/${resource.id}`
        })
      } else {
        // Fallback: copier l'URL dans le presse-papiers
        await navigator.clipboard.writeText(
          window.location.origin + `/library/${resource.id}`
        )
      }
      
      store.recordAction(resource.id, 'share', {
        method: navigator.share ? 'native' : 'clipboard'
      })
      
      return {
        success: true,
        message: navigator.share 
          ? `"${resource.title}" partagé avec succès`
          : `Lien de "${resource.title}" copié dans le presse-papiers`
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du partage: ${error}`
      }
    }
  }
  
  return {
    handleDownload,
    handleView,
    handleFavorite,
    handleShare,
    getResourceStats: store.getResourceStats,
    isFavorite: store.isFavorite
  }
}

// Hook pour les statistiques globales
export const useResourceStats = () => {
  const getAllStats = useResourceStore((state) => state.getAllStats)
  const getPopularResources = useResourceStore((state) => state.getPopularResources)
  const getRecentResources = useResourceStore((state) => state.getRecentResources)
  const exportStats = useResourceStore((state) => state.exportStats)
  
  return {
    getAllStats,
    getPopularResources,
    getRecentResources,
    exportStats
  }
}

// Utilitaire pour générer un ID d'événement unique
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
