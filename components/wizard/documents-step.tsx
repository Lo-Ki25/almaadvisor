"use client"

import React from 'react'
import { Upload, FileText, Trash2, AlertCircle, FileUp, TestTube, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { FileData, DocumentsFormData, validateFile, acceptedFileTypes, maxTotalFiles } from '@/lib/validations/wizard'

interface DocumentsStepProps {
  data: DocumentsFormData
  uploadedFiles: FileData[]
  onUpdate: (data: Partial<DocumentsFormData>) => void
  onAddFiles: (files: FileData[]) => void
  onRemoveFile: (index: number) => void
  onToggleWithoutSource: (withoutSource: boolean) => void
  onNext: () => void
  onPrev: () => void
  isValid: boolean
  errors: string[]
  isProcessing?: boolean
}

export function DocumentsStep({
  data,
  uploadedFiles,
  onUpdate,
  onAddFiles,
  onRemoveFile,
  onToggleWithoutSource,
  onNext,
  onPrev,
  isValid,
  errors,
  isProcessing = false
}: DocumentsStepProps) {
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    // Vérifier le nombre total de fichiers
    if (uploadedFiles.length + files.length > maxTotalFiles) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez pas uploader plus de ${maxTotalFiles} fichiers`,
        variant: "destructive",
      })
      return
    }

    const validFiles: FileData[] = []
    const invalidFiles: string[] = []

    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validFiles.push({
          file,
          status: "pending",
          progress: 0,
        })
      } else {
        invalidFiles.push(validation.error || `Erreur avec ${file.name}`)
      }
    })

    // Ajouter les fichiers valides
    if (validFiles.length > 0) {
      onAddFiles(validFiles)
      toast({
        title: "Fichiers ajoutés",
        description: `${validFiles.length} fichier(s) sélectionné(s)`,
      })
    }

    // Afficher les erreurs pour les fichiers invalides
    if (invalidFiles.length > 0) {
      toast({
        title: "Certains fichiers ont été ignorés",
        description: invalidFiles.join(', '),
        variant: "destructive",
      })
    }

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleToggleWithoutSource = (checked: boolean) => {
    onToggleWithoutSource(checked)
    
    if (checked) {
      toast({
        title: "Mode prototypage activé",
        description: "Vous pouvez maintenant continuer sans uploader de documents",
      })
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('sheet') || file.type.includes('excel')) return '📊'
    if (file.type.includes('csv')) return '📈'
    if (file.name.endsWith('.md')) return '📋'
    if (file.type.includes('text')) return '📄'
    if (file.type.includes('zip')) return '📦'
    return '📎'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Documents sources
        </CardTitle>
        <CardDescription>
          Uploadez vos documents ou activez le mode prototypage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Mode sans source */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="without-source" className="text-blue-900 font-medium">
                  Démarrer sans documents (mode prototypage)
                </Label>
                <p className="text-sm text-blue-700 mt-1">
                  Générer un rapport de démonstration avec des données d'exemple
                </p>
              </div>
            </div>
            <Switch
              id="without-source"
              checked={data.withoutSource}
              onCheckedChange={handleToggleWithoutSource}
              disabled={isProcessing}
            />
          </div>
        </div>

        {!data.withoutSource && (
          <>
            {/* Zone d'upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mb-6">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Glissez-déposez vos documents</h3>
              <p className="text-muted-foreground mb-4">
                Formats acceptés : PDF, DOCX, XLSX, CSV, MD, TXT, ZIP
              </p>
              <div className="text-xs text-muted-foreground mb-4">
                Taille max par fichier : 50MB • Max {maxTotalFiles} fichiers au total
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={Object.keys(acceptedFileTypes).join(',')}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button 
                variant="outline" 
                onClick={openFileDialog}
                disabled={uploadedFiles.length >= maxTotalFiles || isProcessing}
                className="cursor-pointer"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Sélectionner des fichiers
              </Button>
            </div>

            {/* Liste des fichiers uploadés */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Fichiers sélectionnés ({uploadedFiles.length}/{maxTotalFiles})
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(uploadedFiles.reduce((acc, f) => acc + f.file.size, 0))} total
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {uploadedFiles.map((fileData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getFileTypeIcon(fileData.file)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate" title={fileData.file.name}>
                            {fileData.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(fileData.file.size)}</span>
                            <span>•</span>
                            <span>{fileData.file.type || 'Type inconnu'}</span>
                          </div>
                          
                          {/* Barre de progression si en cours d'upload */}
                          {fileData.status === 'uploading' && (
                            <div className="mt-1">
                              <Progress value={fileData.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Statut */}
                        {fileData.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            En attente
                          </Badge>
                        )}
                        {fileData.status === 'uploading' && (
                          <Badge variant="outline" className="text-xs">
                            Upload...
                          </Badge>
                        )}
                        {fileData.status === 'success' && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            ✓ Uploadé
                          </Badge>
                        )}
                        {fileData.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">
                            Erreur
                          </Badge>
                        )}
                        
                        {/* Bouton supprimer */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onRemoveFile(index)}
                          disabled={isProcessing}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Mode sans source activé */}
        {data.withoutSource && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Mode prototypage activé.</strong> Un rapport de démonstration sera généré avec des données d'exemple pour vous permettre de tester le système.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={onPrev}
            disabled={isProcessing}
          >
            ← Précédent
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <span className={isValid ? "text-green-600" : "text-amber-600"}>
                {isValid ? "✓" : "⚠"} Documents {isValid ? "prêts" : "requis"}
              </span>
            </div>
            <Button 
              onClick={onNext}
              disabled={!isValid || isProcessing}
              className="min-w-24"
            >
              Suivant →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
