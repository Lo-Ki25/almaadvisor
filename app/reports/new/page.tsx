"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Brain, Settings, ChevronRight, ChevronLeft, CheckCircle, FileUp, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ProjectData {
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

interface UploadedFile {
  file: File
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  id?: string
}

export default function NewReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [projectData, setProjectData] = useState<ProjectData>({
    title: "",
    client: "",
    lead: "",
    language: "FR",
    committee: "",
    style: "",
    methodologies: [],
    ragOptions: {
      chunkSize: 800,
      overlap: 120,
      topK: 8,
    },
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [projectId, setProjectId] = useState<string>("")

  const steps = [
    { id: 1, title: "Métadonnées", icon: FileText, description: "Informations du projet" },
    { id: 2, title: "Documents", icon: Upload, description: "Upload des sources" },
    { id: 3, title: "Méthodologies", icon: Settings, description: "Cadres d'analyse" },
    { id: 4, title: "Génération", icon: Brain, description: "Configuration RAG" },
  ]

  const methodologies = [
    "TOGAF",
    "Zachman",
    "C4 Model",
    "BPMN 2.0",
    "ITIL 4",
    "COBIT 2019",
    "OWASP",
    "ISO 27001",
    "RGPD",
    "Loi 09-08",
    "WCAG 2.2",
    "STRIDE",
    "SRE",
    "FinOps",
    "Balanced Scorecard",
    "Business Model Canvas",
    "Value Proposition Canvas",
    "RICE",
    "MoSCoW",
    "SWOT",
    "PESTEL",
    "FAIR",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload called", event.target.files)
    const files = Array.from(event.target.files || [])
    console.log("Files selected:", files)
    
    if (files.length === 0) {
      console.log("No files selected")
      return
    }
    
    const newFiles: UploadedFile[] = files.map((file) => {
      console.log("Processing file:", file.name, file.size, file.type)
      return {
        file,
        status: "pending" as const,
        progress: 0,
      }
    })
    
    setUploadedFiles((prev) => {
      console.log("Previous files:", prev.length, "New files:", newFiles.length)
      return [...prev, ...newFiles]
    })
    
    toast({
      title: "Fichiers sélectionnés",
      description: `${files.length} fichier(s) ajouté(s)`,
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const createProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) throw new Error("Failed to create project")

      const project = await response.json()
      setProjectId(project.id)
      return project.id
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive",
      })
      throw error
    }
  }

  const uploadFiles = async (projectId: string) => {
    const formData = new FormData()
    uploadedFiles.forEach(({ file }) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`/api/projects/${projectId}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      return await response.json()
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader les fichiers",
        variant: "destructive",
      })
      throw error
    }
  }

  const processDocuments = async (projectId: string) => {
    try {
      // Ingestion
      const ingestResponse = await fetch(`/api/projects/${projectId}/ingest`, {
        method: "POST",
      })
      if (!ingestResponse.ok) throw new Error("Ingestion failed")

      // Embeddings
      const embedResponse = await fetch(`/api/projects/${projectId}/embed`, {
        method: "POST",
      })
      if (!embedResponse.ok) throw new Error("Embedding failed")

      return true
    } catch (error) {
      toast({
        title: "Erreur de traitement",
        description: "Impossible de traiter les documents",
        variant: "destructive",
      })
      throw error
    }
  }

  const generateReport = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Generation failed")

      return await response.json()
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le rapport",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleGenerate = async () => {
    setIsProcessing(true)

    try {
      // Step 1: Create project
      const newProjectId = await createProject()

      // Step 2: Upload files
      if (uploadedFiles.length > 0) {
        await uploadFiles(newProjectId)
      }

      // Step 3: Process documents
      await processDocuments(newProjectId)

      // Step 4: Generate report
      await generateReport(newProjectId)

      toast({
        title: "Succès",
        description: "Rapport généré avec succès",
      })

      router.push(`/reports/${newProjectId}`)
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectData.title && projectData.client
      case 2:
        return uploadedFiles.length > 0
      case 3:
        return projectData.methodologies.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Nouveau Projet RAG</h1>
        <p className="text-muted-foreground">
          Assistant en 4 étapes : Métadonnées → Upload → Méthodologies → Génération
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 ${isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    <div
                      className={`p-2 rounded-full ${isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-green-100 text-green-600" : "bg-muted"}`}
                    >
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="hidden md:block">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-4" />}
                </div>
              )
            })}
          </div>
          <Progress value={(currentStep / 4) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du projet *</Label>
                <Input
                  id="title"
                  value={projectData.title}
                  onChange={(e) => setProjectData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Transformation digitale Morocco Alumni"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Input
                  id="client"
                  value={projectData.client}
                  onChange={(e) => setProjectData((prev) => ({ ...prev, client: e.target.value }))}
                  placeholder="Morocco Alumni"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead">Consultant principal</Label>
                <Input
                  id="lead"
                  value={projectData.lead}
                  onChange={(e) => setProjectData((prev) => ({ ...prev, lead: e.target.value }))}
                  placeholder="Nom du consultant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={projectData.language}
                  onValueChange={(value) => setProjectData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FR">Français</SelectItem>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="BILINGUAL">Bilingue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="committee">Profil du comité</Label>
                <Select
                  value={projectData.committee}
                  onValueChange={(value) => setProjectData((prev) => ({ ...prev, committee: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le profil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institutionnel">Institutionnel</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style de rédaction</Label>
                <Select
                  value={projectData.style}
                  onValueChange={(value) => setProjectData((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cabinet">Cabinet pur</SelectItem>
                    <SelectItem value="pedagogique">Pédagogique</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Glissez-déposez vos documents</h3>
                <p className="text-muted-foreground mb-4">Formats acceptés : PDF, DOCX, XLSX, CSV, MD, TXT, ZIP</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.csv,.md,.txt,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer bg-transparent"
                    onClick={() => {
                      console.log("Button clicked, opening file dialog")
                      document.getElementById("file-upload")?.click()
                    }}
                    type="button"
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Sélectionner des fichiers
                  </Button>
                </Label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Fichiers sélectionnés ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{file.file.type}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Sélectionnez les méthodologies à appliquer</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Ces cadres influenceront la structure et le contenu du rapport généré
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {methodologies.map((methodology) => (
                  <div key={methodology} className="flex items-center space-x-2">
                    <Checkbox
                      id={methodology}
                      checked={projectData.methodologies.includes(methodology)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProjectData((prev) => ({
                            ...prev,
                            methodologies: [...prev.methodologies, methodology],
                          }))
                        } else {
                          setProjectData((prev) => ({
                            ...prev,
                            methodologies: prev.methodologies.filter((m) => m !== methodology),
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={methodology} className="text-sm font-medium">
                      {methodology}
                    </Label>
                  </div>
                ))}
              </div>
              {projectData.methodologies.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Méthodologies sélectionnées :</p>
                  <div className="flex flex-wrap gap-2">
                    {projectData.methodologies.map((methodology) => (
                      <Badge key={methodology} variant="secondary">
                        {methodology}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Configuration du pipeline RAG</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Paramètres pour l'analyse sémantique et la génération de contenu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chunkSize">Taille des chunks</Label>
                  <Input
                    id="chunkSize"
                    type="number"
                    value={projectData.ragOptions.chunkSize}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        ragOptions: { ...prev.ragOptions, chunkSize: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Nombre de caractères par segment</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlap">Chevauchement</Label>
                  <Input
                    id="overlap"
                    type="number"
                    value={projectData.ragOptions.overlap}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        ragOptions: { ...prev.ragOptions, overlap: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Caractères de chevauchement</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topK">Top-K retrieval</Label>
                  <Input
                    id="topK"
                    type="number"
                    value={projectData.ragOptions.topK}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        ragOptions: { ...prev.ragOptions, topK: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Nombre de chunks à récupérer</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Génération automatique incluse :</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Diagrammes C4 (4 niveaux), BPMN, Gantt, STRIDE</li>
                  <li>• Tables RICE, Budget, BSC, RACI, APIs, DataModel</li>
                  <li>• 17 sections structurées avec citations automatiques</li>
                  <li>• Export PDF + annexes (SVG, CSV, checklists)</li>
                </ul>
              </div>

              {isProcessing && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="font-medium">Génération en cours...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Traitement des documents, génération des embeddings et création du rapport
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isProcessing}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep} disabled={!canProceed() || isProcessing}>
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={!canProceed() || isProcessing} size="lg">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Générer le Rapport
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
