"use client"

import { useState } from "react"
import { MethodologySelector } from "./methodology-selector"
import { MethodologyWizard } from "./methodology-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface MethodologyIntegrationProps {
  sectionId?: string
  applicableMethodologies?: string[]
  onComplete?: (methodology: string, data: any) => void
}

export function MethodologyIntegration({
  sectionId,
  applicableMethodologies,
  onComplete,
}: MethodologyIntegrationProps) {
  const [selectedMethodology, setSelectedMethodology] = useState<string | null>(null)
  const [completedMethodologies, setCompletedMethodologies] = useState<
    Array<{
      methodology: string
      data: any
      completedAt: Date
    }>
  >([])

  const handleMethodologyComplete = (data: any) => {
    if (!selectedMethodology) return

    const completed = {
      methodology: selectedMethodology,
      data,
      completedAt: new Date(),
    }

    setCompletedMethodologies((prev) => [...prev, completed])
    onComplete?.(selectedMethodology, data)
    setSelectedMethodology(null)
  }

  const handleBackToSelector = () => {
    setSelectedMethodology(null)
  }

  if (selectedMethodology) {
    return (
      <MethodologyWizard
        methodology={selectedMethodology}
        onComplete={handleMethodologyComplete}
        onCancel={handleBackToSelector}
      />
    )
  }

  return (
    <div className="space-y-6">
      {completedMethodologies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Méthodologies Complétées
            </CardTitle>
            <CardDescription>Méthodologies déjà appliquées à cette section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedMethodologies.map((completed, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{completed.methodology}</p>
                      <p className="text-sm text-muted-foreground">
                        Complété le {completed.completedAt.toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Terminé</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <MethodologySelector
        onSelectMethodology={setSelectedMethodology}
        applicableMethodologies={applicableMethodologies}
      />
    </div>
  )
}
