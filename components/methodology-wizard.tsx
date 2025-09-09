"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Building2, Workflow, Shield, Target, BarChart3, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"

interface MethodologyWizardProps {
  methodology: string
  onComplete: (data: any) => void
  onCancel: () => void
}

export function MethodologyWizard({ methodology, onComplete, onCancel }: MethodologyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const methodologyConfigs = {
    TOGAF: {
      title: "TOGAF Architecture Development Method",
      icon: Building2,
      color: "bg-blue-500",
      steps: [
        {
          title: "Phase Préliminaire",
          description: "Définition du cadre et des principes architecturaux",
          fields: [
            { name: "scope", label: "Périmètre de l'architecture", type: "textarea", required: true },
            { name: "principles", label: "Principes architecturaux", type: "textarea", required: true },
            {
              name: "stakeholders",
              label: "Parties prenantes",
              type: "multiselect",
              options: ["Business", "IT", "Security", "Compliance", "Operations"],
            },
          ],
        },
        {
          title: "Phase A - Vision Architecture",
          description: "Développement de la vision architecturale",
          fields: [
            { name: "businessVision", label: "Vision métier", type: "textarea", required: true },
            { name: "architectureVision", label: "Vision architecture", type: "textarea", required: true },
            { name: "capabilities", label: "Capacités requises", type: "textarea" },
          ],
        },
        {
          title: "Phase B - Architecture Métier",
          description: "Définition de l'architecture métier",
          fields: [
            { name: "businessProcesses", label: "Processus métier", type: "textarea", required: true },
            { name: "organizationStructure", label: "Structure organisationnelle", type: "textarea" },
            { name: "businessServices", label: "Services métier", type: "textarea" },
          ],
        },
      ],
    },
    "C4 Model": {
      title: "C4 Model Architecture Diagrams",
      icon: Workflow,
      color: "bg-green-500",
      steps: [
        {
          title: "Level 1 - System Context",
          description: "Vue d'ensemble du système et de ses interactions",
          fields: [
            { name: "systemName", label: "Nom du système", type: "text", required: true },
            { name: "systemPurpose", label: "Objectif du système", type: "textarea", required: true },
            {
              name: "users",
              label: "Utilisateurs",
              type: "multiselect",
              options: ["End Users", "Administrators", "External Systems", "Third Parties"],
            },
            { name: "externalSystems", label: "Systèmes externes", type: "textarea" },
          ],
        },
        {
          title: "Level 2 - Container Diagram",
          description: "Architecture de haut niveau et déploiement",
          fields: [
            { name: "webApp", label: "Application Web", type: "textarea" },
            { name: "mobileApp", label: "Application Mobile", type: "textarea" },
            { name: "database", label: "Base de données", type: "textarea" },
            { name: "apiGateway", label: "API Gateway", type: "textarea" },
          ],
        },
        {
          title: "Level 3 - Component Diagram",
          description: "Composants internes et leurs responsabilités",
          fields: [
            { name: "controllers", label: "Contrôleurs", type: "textarea" },
            { name: "services", label: "Services métier", type: "textarea" },
            { name: "repositories", label: "Repositories", type: "textarea" },
            { name: "integrations", label: "Intégrations", type: "textarea" },
          ],
        },
      ],
    },
    "Business Model Canvas": {
      title: "Business Model Canvas",
      icon: Target,
      color: "bg-purple-500",
      steps: [
        {
          title: "Segments de Clientèle",
          description: "Définition des groupes de clients ciblés",
          fields: [
            { name: "customerSegments", label: "Segments de clientèle", type: "textarea", required: true },
            { name: "customerNeeds", label: "Besoins clients", type: "textarea", required: true },
            { name: "customerBehavior", label: "Comportements clients", type: "textarea" },
          ],
        },
        {
          title: "Propositions de Valeur",
          description: "Valeur créée pour chaque segment client",
          fields: [
            { name: "valuePropositions", label: "Propositions de valeur", type: "textarea", required: true },
            { name: "painRelievers", label: "Réducteurs de douleur", type: "textarea" },
            { name: "gainCreators", label: "Créateurs de gains", type: "textarea" },
          ],
        },
        {
          title: "Canaux et Relations",
          description: "Comment atteindre et fidéliser les clients",
          fields: [
            { name: "channels", label: "Canaux de distribution", type: "textarea", required: true },
            { name: "customerRelationships", label: "Relations clients", type: "textarea", required: true },
            { name: "touchpoints", label: "Points de contact", type: "textarea" },
          ],
        },
      ],
    },
    RICE: {
      title: "RICE Prioritization Framework",
      icon: BarChart3,
      color: "bg-orange-500",
      steps: [
        {
          title: "Reach - Portée",
          description: "Nombre de personnes/processus impactés",
          fields: [
            {
              name: "reachMetric",
              label: "Métrique de portée",
              type: "select",
              options: ["Users per month", "Transactions per day", "Processes affected", "Teams impacted"],
              required: true,
            },
            { name: "reachValue", label: "Valeur de portée", type: "number", required: true },
            { name: "reachJustification", label: "Justification", type: "textarea" },
          ],
        },
        {
          title: "Impact - Impact",
          description: "Ampleur de l'impact par personne/processus",
          fields: [
            {
              name: "impactScore",
              label: "Score d'impact",
              type: "select",
              options: ["3 - Massive", "2 - High", "1 - Medium", "0.5 - Low", "0.25 - Minimal"],
              required: true,
            },
            { name: "impactDescription", label: "Description de l'impact", type: "textarea", required: true },
            { name: "impactMetrics", label: "Métriques d'impact", type: "textarea" },
          ],
        },
        {
          title: "Confidence & Effort",
          description: "Niveau de confiance et effort requis",
          fields: [
            {
              name: "confidenceScore",
              label: "Score de confiance",
              type: "select",
              options: ["100% - High", "80% - Medium", "50% - Low"],
              required: true,
            },
            { name: "effortEstimate", label: "Estimation d'effort (person-months)", type: "number", required: true },
            { name: "riskFactors", label: "Facteurs de risque", type: "textarea" },
          ],
        },
      ],
    },
    "GDPR Compliance": {
      title: "GDPR Compliance Assessment",
      icon: Shield,
      color: "bg-red-500",
      steps: [
        {
          title: "Data Mapping",
          description: "Cartographie des données personnelles",
          fields: [
            {
              name: "dataTypes",
              label: "Types de données collectées",
              type: "multiselect",
              options: ["Identity", "Contact", "Financial", "Health", "Biometric", "Location", "Behavioral"],
              required: true,
            },
            { name: "dataProcessing", label: "Finalités de traitement", type: "textarea", required: true },
            { name: "dataRetention", label: "Durée de conservation", type: "textarea", required: true },
          ],
        },
        {
          title: "Legal Basis",
          description: "Base légale du traitement",
          fields: [
            {
              name: "legalBasis",
              label: "Base légale",
              type: "select",
              options: [
                "Consent",
                "Contract",
                "Legal obligation",
                "Vital interests",
                "Public task",
                "Legitimate interests",
              ],
              required: true,
            },
            { name: "consentMechanism", label: "Mécanisme de consentement", type: "textarea" },
            {
              name: "dataSubjectRights",
              label: "Droits des personnes",
              type: "multiselect",
              options: ["Access", "Rectification", "Erasure", "Portability", "Restriction", "Objection"],
            },
          ],
        },
        {
          title: "Security Measures",
          description: "Mesures de sécurité techniques et organisationnelles",
          fields: [
            { name: "technicalMeasures", label: "Mesures techniques", type: "textarea", required: true },
            { name: "organizationalMeasures", label: "Mesures organisationnelles", type: "textarea", required: true },
            { name: "dataBreachProcedure", label: "Procédure de violation", type: "textarea" },
          ],
        },
      ],
    },
  }

  const config = methodologyConfigs[methodology as keyof typeof methodologyConfigs]
  if (!config) return null

  const IconComponent = config.icon
  const progress = ((currentStep + 1) / config.steps.length) * 100

  const handleNext = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentStepData = config.steps[currentStep]
  const isLastStep = currentStep === config.steps.length - 1

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{config.title}</CardTitle>
              <CardDescription>
                Étape {currentStep + 1} sur {config.steps.length}: {currentStepData.title}
              </CardDescription>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
          </div>

          <div className="space-y-4">
            {currentStepData.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {field.type === "text" && (
                  <Input
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => updateFormData(field.name, e.target.value)}
                    placeholder={`Saisissez ${field.label.toLowerCase()}`}
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => updateFormData(field.name, e.target.value)}
                    placeholder={`Décrivez ${field.label.toLowerCase()}`}
                    rows={4}
                  />
                )}

                {field.type === "number" && (
                  <Input
                    id={field.name}
                    type="number"
                    value={formData[field.name] || ""}
                    onChange={(e) => updateFormData(field.name, Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                )}

                {field.type === "select" && (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(value) => updateFormData(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Sélectionnez ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "multiselect" && (
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.name}-${option}`}
                          checked={(formData[field.name] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const current = formData[field.name] || []
                            if (checked) {
                              updateFormData(field.name, [...current, option])
                            } else {
                              updateFormData(
                                field.name,
                                current.filter((item: string) => item !== option),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`${field.name}-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>

            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
