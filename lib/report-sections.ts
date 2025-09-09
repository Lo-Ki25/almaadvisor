export interface ReportSection {
  id: string
  title: string
  keywords: string[]
  template: string
  required: boolean
}

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "cover",
    title: "Page de garde",
    keywords: ["titre", "client", "consultant", "date"],
    template: `# {{title}}

**Client:** {{client}}  
**Consultant:** {{lead}}  
**Date:** {{date}}  
**Langue:** {{language}}`,
    required: true,
  },
  {
    id: "toc",
    title: "Sommaire",
    keywords: ["sommaire", "table des matières"],
    template: `# Sommaire

[Généré automatiquement]`,
    required: true,
  },
  {
    id: "executive-summary",
    title: "Résumé exécutif",
    keywords: ["résumé", "synthèse", "enjeux", "recommandations"],
    template: `# Résumé exécutif

## Contexte et enjeux
{{context}}

## Principales recommandations
{{recommendations}}

## Points clés
{{keyPoints}}`,
    required: true,
  },
  {
    id: "context",
    title: "Contexte & enjeux",
    keywords: ["contexte", "enjeux", "problématique", "situation actuelle"],
    template: `# Contexte & enjeux

## Situation actuelle
{{currentSituation}}

## Enjeux identifiés
{{challenges}}

## Objectifs
{{objectives}}`,
    required: true,
  },
  {
    id: "audit",
    title: "Constats d'audit",
    keywords: ["audit", "constats", "analyse", "diagnostic"],
    template: `# Constats d'audit

## Méthodologie
{{methodology}}

## Constats techniques
{{technicalFindings}}

## Constats organisationnels
{{organizationalFindings}}

## Points d'amélioration
{{improvements}}`,
    required: true,
  },
  {
    id: "benchmark",
    title: "Benchmark & écarts",
    keywords: ["benchmark", "comparaison", "écarts", "bonnes pratiques"],
    template: `# Benchmark & écarts

## Référentiels analysés
{{benchmarks}}

## Écarts identifiés
{{gaps}}

## Bonnes pratiques
{{bestPractices}}`,
    required: true,
  },
  {
    id: "vision",
    title: "Vision & positionnement",
    keywords: ["vision", "stratégie", "positionnement", "business model"],
    template: `# Vision & positionnement

## Vision stratégique
{{vision}}

## Business Model Canvas
{{businessModel}}

## Value Proposition Canvas
{{valueProposition}}`,
    required: true,
  },
  {
    id: "architecture",
    title: "Architecture cible",
    keywords: ["architecture", "technique", "système", "infrastructure"],
    template: `# Architecture cible

## Vue d'ensemble (C4 - Contexte)
{{c4Context}}

## Architecture applicative (C4 - Conteneurs)
{{c4Containers}}

## Architecture technique (C4 - Composants)
{{c4Components}}

## Exigences non fonctionnelles
{{nfr}}`,
    required: true,
  },
  {
    id: "processes",
    title: "Processus",
    keywords: ["processus", "workflow", "procédures", "BPMN"],
    template: `# Processus

## Cartographie des processus
{{processMap}}

## Processus métier (BPMN)
{{bpmnDiagrams}}

## Optimisations proposées
{{optimizations}}`,
    required: true,
  },
  {
    id: "security",
    title: "Sécurité / Conformité",
    keywords: ["sécurité", "conformité", "RGPD", "OWASP", "ISO27001"],
    template: `# Sécurité / Conformité

## Cadre de sécurité (OWASP)
{{owaspFramework}}

## Conformité RGPD / Loi 09-08
{{gdprCompliance}}

## Analyse des risques (STRIDE)
{{strideAnalysis}}

## Mesures de sécurité
{{securityMeasures}}`,
    required: true,
  },
  {
    id: "roadmap",
    title: "Feuille de route",
    keywords: ["roadmap", "planning", "phases", "jalons"],
    template: `# Feuille de route 18-24 mois

## Priorisation (RICE)
{{riceAnalysis}}

## Planning (Gantt)
{{ganttChart}}

## Phases et jalons
{{phases}}`,
    required: true,
  },
  {
    id: "budget",
    title: "Budget & FinOps",
    keywords: ["budget", "coûts", "finops", "ROI"],
    template: `# Budget & FinOps

## Estimation budgétaire
{{budgetEstimate}}

## Répartition CAPEX/OPEX
{{capexOpex}}

## Unit Economics
{{unitEconomics}}

## ROI et métriques financières
{{roi}}`,
    required: true,
  },
  {
    id: "governance",
    title: "Gouvernance",
    keywords: ["gouvernance", "organisation", "RACI", "rôles"],
    template: `# Gouvernance

## Structure organisationnelle
{{orgStructure}}

## Matrice RACI
{{raciMatrix}}

## Processus de décision
{{decisionProcess}}`,
    required: true,
  },
  {
    id: "kpis",
    title: "KPI / SLI-SLO",
    keywords: ["KPI", "métriques", "SLI", "SLO", "monitoring"],
    template: `# KPI / SLI-SLO

## Balanced Scorecard
{{balancedScorecard}}

## SLI/SLO (SRE)
{{sreMetrics}}

## Tableaux de bord
{{dashboards}}`,
    required: true,
  },
  {
    id: "risks",
    title: "Risques",
    keywords: ["risques", "FAIR", "mitigation", "contingence"],
    template: `# Risques

## Analyse FAIR
{{fairAnalysis}}

## Matrice des risques
{{riskMatrix}}

## Plans de mitigation
{{mitigationPlans}}`,
    required: true,
  },
  {
    id: "conclusion",
    title: "Conclusion & appel à décision",
    keywords: ["conclusion", "recommandations", "décision", "prochaines étapes"],
    template: `# Conclusion & appel à décision

## Synthèse des recommandations
{{recommendations}}

## Prochaines étapes
{{nextSteps}}

## Appel à décision
{{callToAction}}`,
    required: true,
  },
  {
    id: "annexes",
    title: "Annexes",
    keywords: ["annexes", "diagrammes", "tableaux", "checklists"],
    template: `# Annexes

## Diagrammes techniques
{{diagrams}}

## Tableaux de données
{{dataTables}}

## Checklists de conformité
{{checklists}}`,
    required: true,
  },
]
