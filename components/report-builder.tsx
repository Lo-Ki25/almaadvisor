"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Save, Download, CheckCircle, Circle, Clock } from "lucide-react"
import { documentEngine } from "@/lib/document-engine"
import type { Report } from "@/lib/types"
import { MethodologyIntegration } from "./methodology-integration"
import { DiagramGenerator } from "./diagram-generator"

interface ReportBuilderProps {
  reportId?: string
}

export function ReportBuilder({ reportId }: ReportBuilderProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(!reportId)
  const [activeTab, setActiveTab] = useState("content")
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    consultant: "",
  })

  useEffect(() => {
    if (reportId) {
      const existingReport = documentEngine.getReport(reportId)
      if (existingReport) {
        setReport(existingReport)
        setActiveSectionId(existingReport.sections[0]?.id || "")
        setIsCreating(false)
      }
    }
  }, [reportId])

  const handleCreateReport = () => {
    if (!formData.title || !formData.client || !formData.consultant) return

    const newReport = documentEngine.createReport(formData.title, formData.client, formData.consultant)

    setReport(newReport)
    setActiveSectionId(newReport.sections[0]?.id || "")
    setIsCreating(false)
  }

  const handleSectionUpdate = (sectionId: string, content: string) => {
    if (!report) return

    documentEngine.updateSection(report.id, sectionId, content)

    // Refresh report data
    const updatedReport = documentEngine.getReport(report.id)
    if (updatedReport) {
      setReport(updatedReport)
    }
  }

  const handleExport = () => {
    if (!report) return

    const markdown = documentEngine.exportToMarkdown(report.id)
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.title.replace(/\s+/g, "-")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getProgress = () => {
    if (!report) return { completed: 0, total: 0, percentage: 0 }
    return documentEngine.getReportProgress(report.id)
  }

  const handleDiagramSave = (diagramCode: string, diagramType: string) => {
    if (!report || !activeSectionId) return

    // Add diagram to section content
    const activeSection = report.sections.find((s) => s.id === activeSectionId)
    if (activeSection) {
      const diagramMarkdown = `\n\n## Diagramme ${diagramType}\n\n\`\`\`mermaid\n${diagramCode}\n\`\`\`\n\n`
      const updatedContent = activeSection.content + diagramMarkdown
      handleSectionUpdate(activeSectionId, updatedContent)
    }
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nouveau Rapport ALMA-ADVISOR
            </CardTitle>
            <CardDescription>Créez un nouveau dossier institutionnel de transformation digitale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Projet</Label>
              <Input
                id="title"
                placeholder="Ex: Transformation Digitale - Modernisation SI"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                placeholder="Ex: Ministère de l'Économie"
                value={formData.client}
                onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultant">Consultant Principal</Label>
              <Input
                id="consultant"
                placeholder="Ex: Jean Dupont, Senior Partner"
                value={formData.consultant}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultant: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleCreateReport}
              disabled={!formData.title || !formData.client || !formData.consultant}
              className="w-full"
            >
              Créer le Rapport
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return <div>Rapport non trouvé</div>
  }

  const progress = getProgress()
  const activeSection = report.sections.find((s) => s.id === activeSectionId) || report.sections[0]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">{report.title}</h2>
            <Badge variant="outline">{report.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{report.client}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress.completed} sur {progress.total} sections complétées
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {report.sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-auto p-3"
                onClick={() => setActiveSectionId(section.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  {section.completed ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">
                      {section.order}. {section.title}
                    </div>
                    {section.methodology && section.methodology.length > 0 && (
                      <div className="text-xs text-muted-foreground">{section.methodology.join(", ")}</div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button onClick={handleExport} variant="outline" className="w-full bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exporter en Markdown
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{activeSection.title}</h1>
              <p className="text-sm text-muted-foreground">
                Section {activeSection.order} sur {report.sections.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeSection.methodology &&
                activeSection.methodology.map((method) => (
                  <Badge key={method} variant="secondary" className="text-xs">
                    {method}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="methodologies">Méthodologies</TabsTrigger>
              <TabsTrigger value="diagrams">Diagrammes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="flex-1 p-4">
            <Textarea
              value={activeSection.content}
              onChange={(e) => handleSectionUpdate(activeSection.id, e.target.value)}
              className="w-full h-full resize-none font-mono text-sm"
              placeholder="Rédigez le contenu de cette section..."
            />
          </TabsContent>

          <TabsContent value="methodologies" className="flex-1 p-4 overflow-y-auto">
            <MethodologyIntegration
              sectionId={activeSection.id}
              applicableMethodologies={activeSection.methodology}
              onComplete={(methodology, data) => {
                console.log(`Methodology ${methodology} completed for section ${activeSection.id}`, data)
              }}
            />
          </TabsContent>

          <TabsContent value="diagrams" className="flex-1 p-4 overflow-y-auto">
            <DiagramGenerator onSave={handleDiagramSave} />
          </TabsContent>
        </Tabs>

        <div className="border-t p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Dernière modification: {report.updatedAt.toLocaleString("fr-FR")}
            </div>
            <Button onClick={() => handleSectionUpdate(activeSection.id, activeSection.content)} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
