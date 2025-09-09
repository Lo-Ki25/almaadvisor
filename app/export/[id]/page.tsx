"use client"

import { useEffect, useState } from "react"
import { ExportSystem } from "@/components/export-system"
import { documentEngine } from "@/lib/document-engine"
import type { Report } from "@/lib/types"

interface ExportPageProps {
  params: {
    id: string
  }
}

export default function ExportPage({ params }: ExportPageProps) {
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    const foundReport = documentEngine.getReport(params.id)
    setReport(foundReport || null)
  }, [params.id])

  if (!report) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Rapport non trouvé</h1>
        <p className="text-muted-foreground">Le rapport demandé n'existe pas ou a été supprimé.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export du Rapport</h1>
        <p className="text-muted-foreground">
          {report.title} - {report.client}
        </p>
      </div>

      <ExportSystem
        report={report}
        onExportComplete={(format, success) => {
          if (success) {
            console.log(`Export successful: ${format}`)
          } else {
            console.error(`Export failed: ${format}`)
          }
        }}
      />
    </div>
  )
}
