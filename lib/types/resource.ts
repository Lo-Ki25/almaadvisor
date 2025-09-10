// Types pour les ressources de la bibliothèque avec métadonnées complètes

export interface Resource {
  id: string
  name: string
  title: string // Titre affiché (peut différer du nom de fichier)
  type: ResourceType
  category: ResourceCategory
  size: number // en bytes
  uploadedAt: string
  processedAt?: string
  lastViewedAt?: string
  status: ResourceStatus
  tags: string[]
  description?: string
  content?: string // Contenu textuel pour aperçu
  checksum: string // Hash MD5 du fichier
  downloadCount: number
  viewCount: number
  author?: string
  version?: string
  isPublic: boolean
  thumbnailUrl?: string
  previewUrl?: string
  metadata: ResourceMetadata
}

export type ResourceType = 
  | 'pdf' 
  | 'docx' 
  | 'txt' 
  | 'md'
  | 'xlsx' 
  | 'csv'
  | 'jpg' 
  | 'png' 
  | 'svg'
  | 'json'
  | 'yaml'
  | 'xml'

export type ResourceCategory = 
  | 'architecture'
  | 'documentation'
  | 'rapport'
  | 'analyse'
  | 'specifications'
  | 'templates'
  | 'guides'
  | 'images'
  | 'données'
  | 'configuration'
  | 'other'

export type ResourceStatus = 
  | 'pending'
  | 'processing'
  | 'processed' 
  | 'error'
  | 'archived'

export interface ResourceMetadata {
  pages?: number // Pour les PDFs
  words?: number // Pour les documents texte
  dimensions?: { width: number; height: number } // Pour les images
  encoding?: string // Pour les fichiers texte
  language?: string
  extractedText?: string
  keywords?: string[]
  summary?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  topics?: string[]
}

// Filtres et tri
export interface ResourceFilters {
  search: string
  category: ResourceCategory | 'all'
  type: ResourceType | 'all'
  status: ResourceStatus | 'all'
  tags: string[]
  author?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export type ResourceSortOption = 
  | 'recent'      // Plus récents d'abord
  | 'popular'     // Plus consultés d'abord
  | 'downloads'   // Plus téléchargés d'abord
  | 'name'        // Ordre alphabétique
  | 'size'        // Par taille
  | 'type'        // Par type de fichier

export interface ResourceStats {
  totalResources: number
  totalSize: number
  totalDownloads: number
  totalViews: number
  byCategory: Record<ResourceCategory, number>
  byType: Record<ResourceType, number>
  byStatus: Record<ResourceStatus, number>
  popularResources: Resource[]
  recentResources: Resource[]
}

// Actions sur les ressources
export type ResourceAction = 
  | 'view'
  | 'download'
  | 'share'
  | 'edit'
  | 'delete'
  | 'archive'
  | 'favorite'

export interface ResourceActionResult {
  success: boolean
  message?: string
  data?: any
}

// Événements pour le tracking
export interface ResourceEvent {
  id: string
  resourceId: string
  action: ResourceAction
  userId?: string
  timestamp: string
  metadata?: Record<string, any>
}

// Aperçu des ressources
export interface ResourcePreview {
  type: 'text' | 'image' | 'pdf' | 'unsupported'
  content?: string
  imageUrl?: string
  pdfUrl?: string
  error?: string
}

export interface ResourceViewerProps {
  resource: Resource
  onClose: () => void
  onDownload?: () => void
  onShare?: () => void
}

// Utilitaires de validation
export const RESOURCE_TYPE_EXTENSIONS: Record<ResourceType, string[]> = {
  pdf: ['.pdf'],
  docx: ['.docx', '.doc'],
  txt: ['.txt'],
  md: ['.md', '.markdown'],
  xlsx: ['.xlsx', '.xls'],
  csv: ['.csv'],
  jpg: ['.jpg', '.jpeg'],
  png: ['.png'],
  svg: ['.svg'],
  json: ['.json'],
  yaml: ['.yaml', '.yml'],
  xml: ['.xml']
}

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  architecture: 'Architecture',
  documentation: 'Documentation',
  rapport: 'Rapports',
  analyse: 'Analyses',
  specifications: 'Spécifications',
  templates: 'Templates',
  guides: 'Guides',
  images: 'Images',
  données: 'Données',
  configuration: 'Configuration',
  other: 'Autre'
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  pending: 'En attente',
  processing: 'En traitement',
  processed: 'Traité',
  error: 'Erreur',
  archived: 'Archivé'
}

export const RESOURCE_SORT_LABELS: Record<ResourceSortOption, string> = {
  recent: 'Plus récents',
  popular: 'Plus consultés',
  downloads: 'Plus téléchargés',
  name: 'Nom (A-Z)',
  size: 'Taille',
  type: 'Type de fichier'
}

// Constantes de validation
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_TAGS = 10
export const MAX_TAG_LENGTH = 50
