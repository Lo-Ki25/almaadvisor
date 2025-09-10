"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, FileX, RefreshCw, Wifi, WifiOff, BookOpen, Database, FileText, Plus } from "lucide-react"
import { type ReactNode } from "react"

// Loading Skeleton Components
export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-64" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-2 w-32" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function GridItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Error State Components
interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  showRetry?: boolean
  children?: ReactNode
}

export function ErrorState({
  title = "Une erreur s'est produite",
  message = "Impossible de charger les données",
  retry,
  showRetry = true,
  children
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">{title}</h3>
          <p className="text-red-700 mb-6 max-w-md mx-auto">{message}</p>
          {showRetry && retry && (
            <Button onClick={retry} variant="outline" className="bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function NetworkErrorState({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Problème de connexion"
      message="Vérifiez votre connexion internet et réessayez"
      retry={retry}
    >
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <WifiOff className="h-4 w-4" />
        <span>Hors ligne</span>
      </div>
    </ErrorState>
  )
}

export function TimeoutErrorState({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Délai d'attente dépassé"
      message="L'opération a pris trop de temps. Veuillez réessayer."
      retry={retry}
    />
  )
}

// Empty State Components
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }
  children?: ReactNode
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  children 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
          {action && (
            <Button onClick={action.onClick} size="lg">
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function SearchEmptyState({ 
  searchTerm, 
  onClear 
}: { 
  searchTerm: string
  onClear: () => void 
}) {
  return (
    <EmptyState
      icon={FileX}
      title="Aucun résultat trouvé"
      description={`Aucun élément ne correspond à "${searchTerm}". Essayez avec d'autres termes de recherche.`}
      action={{
        label: "Effacer la recherche",
        onClick: onClear,
      }}
    />
  )
}

// Loading States
export function FullPageLoading({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-96 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Chargement en cours"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function InlineLoading({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" role="status" aria-label="Chargement en cours"></div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

// Data State Manager Component
interface DataStateProps<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
  children: (data: T[]) => React.ReactNode
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  errorComponent?: React.ReactNode
}

export function DataState<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  emptyComponent,
  errorComponent
}: DataStateProps<T>) {
  if (error) {
    if (errorComponent) return <>{errorComponent}</>
    
    const errorMessage = error.message
    if (errorMessage.includes('Délai d\'attente') || errorMessage.includes('timeout')) {
      return <TimeoutErrorState retry={onRetry} />
    }
    if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
      return <NetworkErrorState retry={onRetry} />
    }
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger les données. Réessayer."
        retry={onRetry}
      />
    )
  }

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (data.length === 0) {
    return <>{emptyComponent}</>
  }

  return <>{children(data)}</>
}

// Specialized Empty States
export function LibraryEmptyState({ onCreateDocument }: { onCreateDocument?: () => void }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Bibliothèque vide"
      description="Aucun document dans votre bibliothèque. Commencez par ajouter des documents pour enrichir vos analyses."
      action={onCreateDocument ? {
        label: "Ajouter un document",
        onClick: onCreateDocument,
        icon: Plus
      } : undefined}
    />
  )
}

export function AdminTableEmptyState({ entityName, onCreateEntity }: { entityName: string, onCreateEntity?: () => void }) {
  return (
    <EmptyState
      icon={Database}
      title={`Aucun ${entityName}`}
      description={`Aucun ${entityName} n'a été créé pour le moment. Commencez par en ajouter un.`}
      action={onCreateEntity ? {
        label: `Créer ${entityName}`,
        onClick: onCreateEntity,
        icon: Plus
      } : undefined}
    />
  )
}

// Data Skeleton Components
export function DataSkeleton({ type = "list", count = 3 }: { type?: "list" | "grid" | "table", count?: number }) {
  const items = Array.from({ length: count })
  
  switch (type) {
    case "grid":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((_, i) => <GridItemSkeleton key={i} />)}
        </div>
      )
    case "table":
      return (
        <div className="rounded-md border">
          <table className="w-full">
            <tbody>
              {items.map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      )
    case "list":
    default:
      return (
        <div className="space-y-4">
          {items.map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      )
  }
}

// Connection Status
export function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>En ligne</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Hors ligne</span>
        </>
      )}
    </div>
  )
}
