"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  File,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DataState, DataSkeleton, LibraryEmptyState, SearchEmptyState } from "@/components/ui/states"

// Types
interface Document {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'txt' | 'xlsx' | 'jpg' | 'png'
  size: number
  uploadedAt: string
  processedAt?: string
  status: 'pending' | 'processed' | 'error'
  tags: string[]
  description?: string
}

// API functions with timeout
async function fetchDocuments(): Promise<Document[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const response = await fetch('/api/library/documents', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé. Veuillez réessayer.')
    }
    throw error
  }
}

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Rapport Architecture.pdf',
    type: 'pdf',
    size: 2548576,
    uploadedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:32:00Z',
    status: 'processed',
    tags: ['architecture', 'technique'],
    description: 'Document d\'architecture système'
  },
  {
    id: '2',
    name: 'Analyse Sécurité.docx',
    type: 'docx',
    size: 1048576,
    uploadedAt: '2024-01-14T09:15:00Z',
    processedAt: '2024-01-14T09:18:00Z',
    status: 'processed',
    tags: ['sécurité', 'audit'],
    description: 'Analyse de sécurité complète'
  },
  {
    id: '3',
    name: 'Données Métier.xlsx',
    type: 'xlsx',
    size: 524288,
    uploadedAt: '2024-01-13T14:20:00Z',
    status: 'pending',
    tags: ['données', 'métier']
  }
]

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Simulate query - replace with real API call
  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['library-documents'],
    queryFn: () => {
      // Simulate loading delay and potential errors
      return new Promise<Document[]>((resolve, reject) => {
        setTimeout(() => {
          // Uncomment to simulate error: reject(new Error('Network error'))
          // Uncomment to simulate empty: resolve([])
          resolve(mockDocuments)
        }, 1000)
      })
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return FileText
      case 'docx':
        return File
      case 'xlsx':
        return FileSpreadsheet
      case 'jpg':
      case 'png':
        return Image
      default:
        return FileText
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'processed':
        return "bg-green-100 text-green-800"
      case 'pending':
        return "bg-yellow-100 text-yellow-800"
      case 'error':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: Document['status']) => {
    const labels = {
      processed: 'Traité',
      pending: 'En attente',
      error: 'Erreur'
    }
    return labels[status]
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [documents, searchTerm, typeFilter, statusFilter])

  const handleRetry = () => {
    refetch()
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
  }

  const handleCreateDocument = () => {
    // Navigate to upload page or open modal
    console.log('Create document clicked')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bibliothèque Documentaire</h1>
          <p className="text-muted-foreground">
            Gérez tous vos documents traités et analysés par l'IA
          </p>
        </div>
        <Button size="lg" onClick={handleCreateDocument}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="jpg">Image JPG</SelectItem>
                  <SelectItem value="png">Image PNG</SelectItem>
                  <SelectItem value="txt">Texte</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="processed">Traité</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List with Tri-State Pattern */}
      <DataState
        data={filteredDocuments}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        loadingComponent={<DataSkeleton type="list" count={5} />}
        emptyComponent={
          searchTerm || typeFilter !== "all" || statusFilter !== "all" ? (
            <SearchEmptyState 
              searchTerm={searchTerm || `${typeFilter !== "all" ? typeFilter : ""}${statusFilter !== "all" ? ` (${statusFilter})` : ""}`}
              onClear={handleClearSearch}
            />
          ) : (
            <LibraryEmptyState onCreateDocument={handleCreateDocument} />
          )
        }
      >
        {(filteredDocs) => (
          <div className="space-y-4">
            {filteredDocs.map((doc) => {
              const FileIcon = getFileIcon(doc.type)
              
              return (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-muted">
                          <FileIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{doc.name}</h3>
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusLabel(doc.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {doc.description || "Aucune description"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                            {doc.tags.length > 0 && (
                              <div className="flex gap-1">
                                {doc.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </DataState>

      {/* Stats Summary */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Aperçu de votre bibliothèque documentaire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{documents.length}</div>
                <div className="text-sm text-muted-foreground">Total documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'processed').length}
                </div>
                <div className="text-sm text-muted-foreground">Documents traités</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(documents.reduce((acc, d) => acc + d.size, 0) / 1024 / 1024)}MB
                </div>
                <div className="text-sm text-muted-foreground">Espace utilisé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
