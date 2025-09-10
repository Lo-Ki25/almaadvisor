import { Resource } from '@/lib/types/resource'

// Données mock complètes pour la bibliothèque de ressources
export const mockResources: Resource[] = [
  {
    id: '1',
    name: 'architecture-microservices.pdf',
    title: 'Architecture Microservices - Guide Complet',
    type: 'pdf',
    category: 'architecture',
    size: 3547824, // ~3.5MB
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:32:15Z',
    lastViewedAt: '2024-01-20T14:22:00Z',
    status: 'processed',
    tags: ['architecture', 'microservices', 'cloud', 'docker'],
    description: 'Guide complet sur l\'architecture microservices avec exemples pratiques, patterns et bonnes pratiques.',
    checksum: 'a3b2c1d4e5f6789012345678901234ab',
    downloadCount: 47,
    viewCount: 123,
    author: 'Jean Dupont',
    version: '2.1',
    isPublic: true,
    thumbnailUrl: '/thumbnails/architecture-microservices.jpg',
    previewUrl: '/previews/architecture-microservices.pdf',
    content: 'Les microservices représentent une approche architecturale qui structure une application comme un ensemble de services faiblement couplés...',
    metadata: {
      pages: 124,
      language: 'fr',
      keywords: ['microservices', 'architecture', 'scalabilité', 'docker', 'kubernetes'],
      summary: 'Guide détaillé sur l\'implémentation d\'une architecture microservices moderne',
      sentiment: 'positive',
      topics: ['architecture', 'développement', 'devops']
    }
  },
  {
    id: '2',
    name: 'audit-securite-2024.docx',
    title: 'Audit de Sécurité - Janvier 2024',
    type: 'docx',
    category: 'analyse',
    size: 1248576, // ~1.2MB
    uploadedAt: '2024-01-14T09:15:00Z',
    processedAt: '2024-01-14T09:18:30Z',
    lastViewedAt: '2024-01-19T16:45:00Z',
    status: 'processed',
    tags: ['sécurité', 'audit', 'RGPD', 'conformité'],
    description: 'Rapport d\'audit de sécurité complet incluant l\'analyse des vulnérabilités et recommandations.',
    checksum: 'b4c3d2e1f0987654321098765432109c',
    downloadCount: 32,
    viewCount: 89,
    author: 'Marie Martin',
    version: '1.0',
    isPublic: false,
    content: 'Executive Summary: L\'audit de sécurité révèle plusieurs points d\'attention majeurs...',
    metadata: {
      words: 8547,
      language: 'fr',
      keywords: ['sécurité', 'vulnérabilités', 'OWASP', 'conformité'],
      summary: 'Audit complet révélant 3 vulnérabilités critiques et 12 recommandations',
      sentiment: 'neutral',
      topics: ['sécurité', 'conformité', 'audit']
    }
  },
  {
    id: '3',
    name: 'donnees-metier.xlsx',
    title: 'Données Métier - Analyse Q4 2023',
    type: 'xlsx',
    category: 'données',
    size: 524288, // 512KB
    uploadedAt: '2024-01-13T14:20:00Z',
    status: 'pending',
    tags: ['données', 'métier', 'analytics', 'Q4'],
    description: 'Analyse des données métier du quatrième trimestre avec KPIs et métriques clés.',
    checksum: 'c5d4e3f2a1b2c3d4e5f6789012345678',
    downloadCount: 15,
    viewCount: 45,
    author: 'Pierre Durand',
    isPublic: true,
    metadata: {
      encoding: 'utf-8',
      keywords: ['KPI', 'métriques', 'analyse', 'trimestre'],
      topics: ['business', 'analytics', 'performance']
    }
  },
  {
    id: '4',
    name: 'guide-utilisateur.md',
    title: 'Guide Utilisateur - ALMA-ADVISOR',
    type: 'md',
    category: 'documentation',
    size: 156432, // ~152KB
    uploadedAt: '2024-01-12T11:00:00Z',
    processedAt: '2024-01-12T11:01:45Z',
    lastViewedAt: '2024-01-21T09:30:00Z',
    status: 'processed',
    tags: ['documentation', 'guide', 'utilisateur', 'onboarding'],
    description: 'Documentation complète pour l\'utilisation d\'ALMA-ADVISOR avec captures d\'écran.',
    checksum: 'd6e5f4a3b2c1d4e5f6789012345678901',
    downloadCount: 67,
    viewCount: 234,
    author: 'Équipe Documentation',
    version: '3.2',
    isPublic: true,
    content: '# Guide Utilisateur ALMA-ADVISOR\n\n## Introduction\n\nBienvenue dans ALMA-ADVISOR, votre assistant IA pour la transformation digitale...',
    metadata: {
      words: 4231,
      language: 'fr',
      keywords: ['guide', 'tutoriel', 'onboarding', 'features'],
      summary: 'Guide complet d\'utilisation de la plateforme ALMA-ADVISOR',
      sentiment: 'positive',
      topics: ['documentation', 'formation', 'utilisation']
    }
  },
  {
    id: '5',
    name: 'schema-architecture.png',
    title: 'Schéma d\'Architecture Système',
    type: 'png',
    category: 'images',
    size: 892416, // ~871KB
    uploadedAt: '2024-01-11T16:45:00Z',
    processedAt: '2024-01-11T16:46:12Z',
    lastViewedAt: '2024-01-18T13:15:00Z',
    status: 'processed',
    tags: ['architecture', 'schéma', 'système', 'diagramme'],
    description: 'Diagramme d\'architecture système montrant les composants et leurs interactions.',
    checksum: 'e7f6a5b4c3d2e1f0987654321098765',
    downloadCount: 28,
    viewCount: 156,
    author: 'Équipe Architecture',
    version: '1.3',
    isPublic: true,
    thumbnailUrl: '/thumbnails/schema-architecture.png',
    metadata: {
      dimensions: { width: 1920, height: 1080 },
      keywords: ['diagramme', 'architecture', 'composants'],
      topics: ['architecture', 'visualisation']
    }
  },
  {
    id: '6',
    name: 'rapport-performance.pdf',
    title: 'Rapport de Performance - Tests Load',
    type: 'pdf',
    category: 'rapport',
    size: 2147483, // ~2.1MB
    uploadedAt: '2024-01-10T13:30:00Z',
    processedAt: '2024-01-10T13:35:22Z',
    status: 'processed',
    tags: ['performance', 'tests', 'load', 'benchmark'],
    description: 'Résultats des tests de charge avec analyse des performances et recommandations d\'optimisation.',
    checksum: 'f8a7b6c5d4e3f2a1b2c3d4e5f6789012',
    downloadCount: 19,
    viewCount: 73,
    author: 'Équipe QA',
    version: '1.0',
    isPublic: false,
    content: 'Tests de performance effectués sur l\'environnement de production avec 1000 utilisateurs simultanés...',
    metadata: {
      pages: 45,
      language: 'fr',
      keywords: ['performance', 'benchmarking', 'optimisation'],
      summary: 'Tests révélant des goulots d\'étranglement sur la base de données',
      sentiment: 'neutral',
      topics: ['performance', 'tests', 'optimisation']
    }
  },
  {
    id: '7',
    name: 'specifications-api.json',
    title: 'Spécifications API REST',
    type: 'json',
    category: 'specifications',
    size: 89432, // ~87KB
    uploadedAt: '2024-01-09T08:15:00Z',
    processedAt: '2024-01-09T08:16:33Z',
    status: 'processed',
    tags: ['API', 'REST', 'documentation', 'OpenAPI'],
    description: 'Spécifications complètes de l\'API REST au format OpenAPI 3.0 avec exemples.',
    checksum: '12345678901234abcdef567890123456',
    downloadCount: 41,
    viewCount: 98,
    author: 'Équipe API',
    version: '2.4',
    isPublic: true,
    content: '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "ALMA-ADVISOR API",\n    "version": "2.4.0"...',
    metadata: {
      encoding: 'utf-8',
      keywords: ['OpenAPI', 'REST', 'endpoints', 'documentation'],
      summary: 'Spécifications API avec 47 endpoints documentés',
      topics: ['API', 'développement', 'intégration']
    }
  },
  {
    id: '8',
    name: 'template-rapport.docx',
    title: 'Template de Rapport Standard',
    type: 'docx',
    category: 'templates',
    size: 345612, // ~337KB
    uploadedAt: '2024-01-08T15:45:00Z',
    processedAt: '2024-01-08T15:46:18Z',
    lastViewedAt: '2024-01-20T11:22:00Z',
    status: 'processed',
    tags: ['template', 'rapport', 'standard', 'modèle'],
    description: 'Modèle de rapport standardisé avec sections prédéfinies et styles cohérents.',
    checksum: '23456789012345bcdef678901234567a',
    downloadCount: 83,
    viewCount: 267,
    author: 'Équipe Template',
    version: '4.1',
    isPublic: true,
    metadata: {
      words: 1234,
      language: 'fr',
      keywords: ['template', 'modèle', 'standardisation'],
      summary: 'Template avec 8 sections prédéfinies et guide d\'utilisation',
      sentiment: 'positive',
      topics: ['templates', 'standardisation', 'documentation']
    }
  },
  {
    id: '9',
    name: 'config-production.yaml',
    title: 'Configuration Production',
    type: 'yaml',
    category: 'configuration',
    size: 12845, // ~12.5KB
    uploadedAt: '2024-01-07T10:00:00Z',
    status: 'error',
    tags: ['configuration', 'production', 'yaml', 'deploy'],
    description: 'Fichier de configuration pour l\'environnement de production.',
    checksum: '34567890123456cdef789012345678ab',
    downloadCount: 8,
    viewCount: 23,
    author: 'DevOps Team',
    version: '1.2',
    isPublic: false,
    metadata: {
      encoding: 'utf-8',
      keywords: ['configuration', 'production', 'déploiement'],
      topics: ['configuration', 'devops', 'production']
    }
  },
  {
    id: '10',
    name: 'mockup-dashboard.png',
    title: 'Mockup Dashboard Analytics',
    type: 'png',
    category: 'images',
    size: 1456789, // ~1.4MB
    uploadedAt: '2024-01-06T14:30:00Z',
    processedAt: '2024-01-06T14:31:05Z',
    status: 'processed',
    tags: ['mockup', 'dashboard', 'UI', 'analytics'],
    description: 'Maquette du nouveau dashboard analytics avec graphiques et métriques en temps réel.',
    checksum: '45678901234567def890123456789abc',
    downloadCount: 24,
    viewCount: 87,
    author: 'Équipe UX',
    version: '2.0',
    isPublic: true,
    thumbnailUrl: '/thumbnails/mockup-dashboard.png',
    metadata: {
      dimensions: { width: 1600, height: 1200 },
      keywords: ['mockup', 'dashboard', 'analytics', 'UI/UX'],
      topics: ['design', 'interface', 'analytics']
    }
  }
]

// Données par défaut à injecter dans le store
export const defaultResourceData: Record<string, Partial<Resource>> = mockResources.reduce((acc, resource) => {
  acc[resource.id] = {
    downloadCount: resource.downloadCount,
    viewCount: resource.viewCount,
    lastViewedAt: resource.lastViewedAt
  }
  return acc
}, {} as Record<string, Partial<Resource>>)

// Utilitaires pour filtrer et trier
export function filterResources(resources: Resource[], filters: {
  search?: string
  category?: string
  type?: string
  status?: string
  tags?: string[]
}): Resource[] {
  return resources.filter(resource => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchesTitle = resource.title.toLowerCase().includes(search)
      const matchesDescription = resource.description?.toLowerCase().includes(search)
      const matchesTags = resource.tags.some(tag => tag.toLowerCase().includes(search))
      const matchesAuthor = resource.author?.toLowerCase().includes(search)
      
      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesAuthor) {
        return false
      }
    }
    
    if (filters.category && filters.category !== 'all' && resource.category !== filters.category) {
      return false
    }
    
    if (filters.type && filters.type !== 'all' && resource.type !== filters.type) {
      return false
    }
    
    if (filters.status && filters.status !== 'all' && resource.status !== filters.status) {
      return false
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every(tag => 
        resource.tags.some(resourceTag => resourceTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasAllTags) {
        return false
      }
    }
    
    return true
  })
}

export function sortResources(resources: Resource[], sortBy: string): Resource[] {
  return [...resources].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      
      case 'popular':
        return (b.viewCount || 0) - (a.viewCount || 0)
      
      case 'downloads':
        return (b.downloadCount || 0) - (a.downloadCount || 0)
      
      case 'name':
        return a.title.localeCompare(b.title, 'fr')
      
      case 'size':
        return b.size - a.size
      
      case 'type':
        return a.type.localeCompare(b.type)
      
      default:
        return 0
    }
  })
}

// Fonction pour obtenir toutes les tags uniques
export function getAllTags(resources: Resource[]): string[] {
  const allTags = resources.flatMap(resource => resource.tags)
  return [...new Set(allTags)].sort()
}

// Fonction pour obtenir tous les auteurs uniques
export function getAllAuthors(resources: Resource[]): string[] {
  const allAuthors = resources
    .map(resource => resource.author)
    .filter(Boolean) as string[]
  return [...new Set(allAuthors)].sort()
}
