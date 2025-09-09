// Core types for ALMA-ADVISOR system

export interface ReportSection {
  id: string
  title: string
  content: string
  order: number
  methodology?: string[]
  diagrams?: Diagram[]
  completed: boolean
}

export interface Diagram {
  id: string
  type: "c4" | "bpmn" | "canvas" | "architecture" | "flowchart"
  title: string
  content: string
  mermaidCode?: string
  plantUMLCode?: string
}

export interface Report {
  id: string
  title: string
  client: string
  projectType: "digital-transformation" | "enterprise-architecture" | "process-optimization"
  status: "draft" | "in-progress" | "review" | "completed"
  sections: ReportSection[]
  createdAt: Date
  updatedAt: Date
  metadata: ReportMetadata
}

export interface ReportMetadata {
  consultant: string
  reviewers: string[]
  deliveryDate?: Date
  confidentialityLevel: "public" | "internal" | "confidential" | "restricted"
  methodologies: string[]
  stakeholders: string[]
}

export interface Methodology {
  id: string
  name: string
  description: string
  framework: string
  applicableSections: number[]
  templates: MethodologyTemplate[]
}

export interface MethodologyTemplate {
  id: string
  name: string
  type: "analysis" | "diagram" | "framework" | "checklist"
  content: string
  variables: TemplateVariable[]
}

export interface TemplateVariable {
  name: string
  type: "text" | "number" | "date" | "select" | "multiselect"
  required: boolean
  options?: string[]
  defaultValue?: any
}

// Standard 17-section structure for ALMA-ADVISOR reports
export const REPORT_SECTIONS = [
  { id: "cover", title: "Page de Couverture", order: 1 },
  { id: "toc", title: "Table des Matières", order: 2 },
  { id: "executive-summary", title: "Résumé Exécutif", order: 3 },
  { id: "context", title: "Contexte et Enjeux", order: 4 },
  { id: "audit", title: "Audit de l'Existant", order: 5 },
  { id: "benchmarking", title: "Benchmarking et Analyse Concurrentielle", order: 6 },
  { id: "gap-analysis", title: "Analyse des Écarts", order: 7 },
  { id: "vision", title: "Vision et Positionnement Stratégique", order: 8 },
  { id: "business-model", title: "Business Model Canvas", order: 9 },
  { id: "target-architecture", title: "Architecture Cible", order: 10 },
  { id: "processes", title: "Modélisation des Processus", order: 11 },
  { id: "security", title: "Sécurité et Conformité", order: 12 },
  { id: "roadmap", title: "Roadmap et Priorisation", order: 13 },
  { id: "budget", title: "Budget et Analyse Financière", order: 14 },
  { id: "governance", title: "Gouvernance et Organisation", order: 15 },
  { id: "kpis", title: "KPIs et Métriques", order: 16 },
  { id: "risks", title: "Analyse des Risques", order: 17 },
] as const
