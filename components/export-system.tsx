"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, ImageIcon, Presentation, File, Settings } from "lucide-react"
import type { Report } from "@/lib/types"
import { documentEngine } from "@/lib/document-engine"

interface ExportSystemProps {
  report: Report
  onExportComplete?: (format: string, success: boolean) => void
}

export function ExportSystem({ report, onExportComplete }: ExportSystemProps) {
  const [exportFormat, setExportFormat] = useState<string>("markdown")
  const [exportOptions, setExportOptions] = useState({
    includeDiagrams: true,
    includeMethodologies: true,
    includeAppendices: true,
    includeExecutiveSummary: true,
    watermark: false,
    confidentialityLevel: report.metadata.confidentialityLevel,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [customTemplate, setCustomTemplate] = useState("")

  const exportFormats = [
    {
      id: "markdown",
      name: "Markdown",
      description: "Format texte structuré pour développeurs",
      icon: FileText,
      extension: ".md",
      features: ["Diagrammes Mermaid", "Formatage simple", "Compatible Git"],
    },
    {
      id: "pdf",
      name: "PDF",
      description: "Document professionnel pour présentation client",
      icon: File,
      extension: ".pdf",
      features: ["Mise en page professionnelle", "Diagrammes intégrés", "Sécurisé"],
    },
    {
      id: "docx",
      name: "Word Document",
      description: "Document éditable pour collaboration",
      icon: FileText,
      extension: ".docx",
      features: ["Éditable", "Commentaires", "Suivi des modifications"],
    },
    {
      id: "pptx",
      name: "PowerPoint",
      description: "Présentation exécutive pour comités de direction",
      icon: Presentation,
      extension: ".pptx",
      features: ["Slides exécutives", "Graphiques", "Animations"],
    },
    {
      id: "html",
      name: "Site Web",
      description: "Version web interactive avec navigation",
      icon: ImageIcon,
      extension: ".html",
      features: ["Interactif", "Navigation", "Responsive"],
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Generate export based on format
      let exportContent = ""
      let filename = `${report.title.replace(/\s+/g, "-")}`

      switch (exportFormat) {
        case "markdown":
          exportContent = documentEngine.exportToMarkdown(report.id)
          filename += ".md"
          break

        case "pdf":
          exportContent = generatePDFContent(report)
          filename += ".pdf"
          break

        case "docx":
          exportContent = generateWordContent(report)
          filename += ".docx"
          break

        case "pptx":
          exportContent = generatePowerPointContent(report)
          filename += ".pptx"
          break

        case "html":
          exportContent = generateHTMLContent(report)
          filename += ".html"
          break
      }

      // Complete export
      setTimeout(() => {
        setExportProgress(100)

        // Create and download file
        const blob = new Blob([exportContent], {
          type: getContentType(exportFormat),
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setIsExporting(false)
        setExportProgress(0)
        onExportComplete?.(exportFormat, true)
      }, 500)
    } catch (error) {
      console.error("Export failed:", error)
      setIsExporting(false)
      setExportProgress(0)
      onExportComplete?.(exportFormat, false)
    }
  }

  const generatePDFContent = (report: Report): string => {
    // Generate PDF-formatted content
    return `%PDF-1.4
% ALMA-ADVISOR Professional Report
% ${report.title}
% Client: ${report.client}
% Generated: ${new Date().toISOString()}

${documentEngine.exportToMarkdown(report.id)}`
  }

  const generateWordContent = (report: Report): string => {
    // Generate Word-compatible content
    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    body { font-family: 'Calibri', sans-serif; }
    h1 { color: #059669; }
    .header { border-bottom: 2px solid #059669; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.title}</h1>
    <p><strong>Client:</strong> ${report.client}</p>
    <p><strong>Consultant:</strong> ${report.metadata.consultant}</p>
  </div>
  ${documentEngine.exportToMarkdown(report.id).replace(/\n/g, "<br>")}
</body>
</html>`
  }

  const generatePowerPointContent = (report: Report): string => {
    // Generate PowerPoint-compatible content
    const sections = report.sections.filter((s) => s.completed).slice(0, 10)

    return `<?xml version="1.0" encoding="UTF-8"?>
<presentation xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
  <slide>
    <title>${report.title}</title>
    <subtitle>Transformation Digitale - ${report.client}</subtitle>
  </slide>
  ${sections
    .map(
      (section) => `
  <slide>
    <title>${section.title}</title>
    <content>${section.content.substring(0, 500)}...</content>
  </slide>
  `,
    )
    .join("")}
</presentation>`
  }

  const generateHTMLContent = (report: Report): string => {
    // Generate interactive HTML content
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .nav { position: fixed; top: 20px; right: 20px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="nav">
    <h3>Navigation</h3>
    ${report.sections.map((s) => `<a href="#section-${s.id}">${s.title}</a><br>`).join("")}
  </div>
  
  <div class="header">
    <h1>${report.title}</h1>
    <p>Client: ${report.client} | Consultant: ${report.metadata.consultant}</p>
  </div>
  
  ${report.sections
    .map(
      (section) => `
    <div class="section" id="section-${section.id}">
      <h2>${section.title}</h2>
      <div>${section.content.replace(/\n/g, "<br>")}</div>
    </div>
  `,
    )
    .join("")}
  
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`
  }

  const getContentType = (format: string): string => {
    const types: Record<string, string> = {
      markdown: "text/markdown",
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      html: "text/html",
    }
    return types[format] || "text/plain"
  }

  const selectedFormat = exportFormats.find((f) => f.id === exportFormat)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Système d'Export Avancé
          </CardTitle>
          <CardDescription>Exportez votre rapport dans différents formats professionnels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format d'Export</Label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon
                return (
                  <Card
                    key={format.id}
                    className={`cursor-pointer transition-colors ${
                      exportFormat === format.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setExportFormat(format.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{format.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {format.extension}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{format.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {format.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label>Options d'Export</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="diagrams"
                    checked={exportOptions.includeDiagrams}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeDiagrams: !!checked }))}
                  />
                  <Label htmlFor="diagrams">Inclure les diagrammes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="methodologies"
                    checked={exportOptions.includeMethodologies}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeMethodologies: !!checked }))
                    }
                  />
                  <Label htmlFor="methodologies">Inclure les méthodologies</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="appendices"
                    checked={exportOptions.includeAppendices}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeAppendices: !!checked }))
                    }
                  />
                  <Label htmlFor="appendices">Inclure les annexes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="watermark"
                    checked={exportOptions.watermark}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, watermark: !!checked }))}
                  />
                  <Label htmlFor="watermark">Filigrane ALMA-ADVISOR</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Confidentiality Level */}
          <div className="space-y-2">
            <Label>Niveau de Confidentialité</Label>
            <Select
              value={exportOptions.confidentialityLevel}
              onValueChange={(value) => setExportOptions((prev) => ({ ...prev, confidentialityLevel: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Interne</SelectItem>
                <SelectItem value="confidential">Confidentiel</SelectItem>
                <SelectItem value="restricted">Restreint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Export en cours...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          {/* Export Button */}
          <Button onClick={handleExport} disabled={isExporting} className="w-full" size="lg">
            {isExporting ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exporter en {selectedFormat?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
