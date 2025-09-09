import { type Report, type ReportSection, REPORT_SECTIONS } from "./types"
import { METHODOLOGIES, COMPLIANCE_FRAMEWORKS } from "./methodologies"

export class DocumentEngine {
  private reports: Map<string, Report> = new Map()

  // Create a new report with the standard 17-section structure
  createReport(title: string, client: string, consultant: string): Report {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const sections: ReportSection[] = REPORT_SECTIONS.map((sectionTemplate) => ({
      id: `${reportId}-${sectionTemplate.id}`,
      title: sectionTemplate.title,
      content: this.getDefaultSectionContent(sectionTemplate.id),
      order: sectionTemplate.order,
      methodology: this.getApplicableMethodologies(sectionTemplate.order),
      diagrams: [],
      completed: false,
    }))

    const report: Report = {
      id: reportId,
      title,
      client,
      projectType: "digital-transformation",
      status: "draft",
      sections,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        consultant,
        reviewers: [],
        confidentialityLevel: "internal",
        methodologies: ["TOGAF", "C4 Model", "BPMN 2.0", "Business Model Canvas"],
        stakeholders: [],
      },
    }

    this.reports.set(reportId, report)
    return report
  }

  // Get default content template for each section
  private getDefaultSectionContent(sectionId: string): string {
    const templates: Record<string, string> = {
      cover: `# {{title}}
## Dossier Institutionnel de Transformation Digitale

**Client:** {{client}}
**Consultant:** {{consultant}}
**Date:** {{date}}
**Niveau de Confidentialité:** {{confidentiality}}

---

*Document conforme aux standards McKinsey & BCG*
*Méthodologies intégrées: TOGAF, C4 Model, BPMN 2.0, ITIL 4*`,

      toc: `# Table des Matières

1. Résumé Exécutif
2. Contexte et Enjeux
3. Audit de l'Existant
4. Benchmarking et Analyse Concurrentielle
5. Analyse des Écarts
6. Vision et Positionnement Stratégique
7. Business Model Canvas
8. Architecture Cible (TOGAF)
9. Modélisation des Processus (BPMN 2.0)
10. Sécurité et Conformité (OWASP, GDPR, WCAG 2.2)
11. Roadmap et Priorisation (RICE)
12. Budget et Analyse Financière (FinOps)
13. Gouvernance et Organisation (RACI, ITIL 4)
14. KPIs et Métriques (SRE)
15. Analyse des Risques (FAIR/STRIDE)
16. Conclusions et Recommandations
17. Annexes`,

      "executive-summary": `# Résumé Exécutif

## Synthèse Stratégique

### Contexte
[Description du contexte organisationnel et des enjeux de transformation digitale]

### Objectifs de la Mission
- Analyse de l'architecture existante
- Définition de l'architecture cible
- Roadmap de transformation
- Estimation budgétaire et ROI

### Recommandations Clés
1. **Architecture:** [Recommandation principale]
2. **Processus:** [Optimisation des processus métier]
3. **Sécurité:** [Mise en conformité réglementaire]
4. **Gouvernance:** [Structure organisationnelle]

### Impact Attendu
- **ROI:** [Retour sur investissement estimé]
- **Délai:** [Timeline de mise en œuvre]
- **Risques:** [Principaux risques identifiés]`,

      context: `# Contexte et Enjeux

## Environnement Organisationnel

### Présentation de l'Organisation
[Description de l'organisation, secteur d'activité, taille, positionnement marché]

### Enjeux Stratégiques
- **Transformation Digitale:** [Objectifs de digitalisation]
- **Compétitivité:** [Positionnement concurrentiel]
- **Réglementaire:** [Contraintes légales et normatives]
- **Opérationnel:** [Efficacité des processus]

### Périmètre de la Mission
- **Fonctionnel:** [Domaines métier concernés]
- **Technique:** [Systèmes et technologies]
- **Organisationnel:** [Équipes et processus]

### Contraintes Identifiées
- **Budgétaires:** [Limitations financières]
- **Temporelles:** [Échéances critiques]
- **Techniques:** [Contraintes technologiques]
- **Humaines:** [Ressources disponibles]`,

      audit: `# Audit de l'Existant

## Architecture Actuelle

### Cartographie des Systèmes
[Inventaire des systèmes existants avec diagramme C4 Level 1]

### Analyse Technique
- **Infrastructure:** [État de l'infrastructure IT]
- **Applications:** [Portfolio applicatif]
- **Données:** [Architecture des données]
- **Sécurité:** [Posture sécuritaire actuelle]

### Processus Métier
[Modélisation BPMN des processus critiques]

### Conformité Réglementaire
- **GDPR:** [État de conformité]
- **WCAG 2.2:** [Accessibilité]
- **OWASP:** [Sécurité applicative]

### Points de Douleur Identifiés
1. [Problème 1 avec impact métier]
2. [Problème 2 avec impact technique]
3. [Problème 3 avec impact organisationnel]`,

      benchmarking: `# Benchmarking et Analyse Concurrentielle

## Analyse du Marché

### Positionnement Concurrentiel
[Matrice de positionnement avec concurrents directs et indirects]

### Meilleures Pratiques Sectorielles
- **Leaders du Marché:** [Analyse des leaders]
- **Innovations Disruptives:** [Technologies émergentes]
- **Standards Industriels:** [Normes et certifications]

### Analyse Comparative
| Critère | Organisation | Concurrent A | Concurrent B | Best Practice |
|---------|--------------|--------------|--------------|---------------|
| Maturité Digitale | [Score] | [Score] | [Score] | [Score] |
| Architecture IT | [Score] | [Score] | [Score] | [Score] |
| Expérience Client | [Score] | [Score] | [Score] | [Score] |

### Opportunités Identifiées
1. **Différenciation:** [Axes de différenciation]
2. **Innovation:** [Opportunités d'innovation]
3. **Efficacité:** [Gains d'efficacité potentiels]`,

      "gap-analysis": `# Analyse des Écarts

## Matrice d'Écarts

### Écarts Fonctionnels
| Domaine | État Actuel | État Cible | Écart | Priorité |
|---------|-------------|------------|-------|----------|
| [Fonction 1] | [Description] | [Objectif] | [Écart] | [P1/P2/P3] |
| [Fonction 2] | [Description] | [Objectif] | [Écart] | [P1/P2/P3] |

### Écarts Techniques
- **Architecture:** [Écarts architecturaux]
- **Performance:** [Écarts de performance]
- **Sécurité:** [Écarts sécuritaires]
- **Intégration:** [Écarts d'intégration]

### Écarts Organisationnels
- **Compétences:** [Gaps de compétences]
- **Processus:** [Processus manquants ou défaillants]
- **Gouvernance:** [Manques en gouvernance]

### Priorisation des Écarts
[Matrice impact/effort pour prioriser les actions de comblement]`,

      vision: `# Vision et Positionnement Stratégique

## Vision Stratégique

### Ambition 2030
[Énoncé de la vision à long terme]

### Objectifs Stratégiques
1. **Excellence Opérationnelle:** [Objectif d'efficacité]
2. **Innovation:** [Objectif d'innovation]
3. **Expérience Client:** [Objectif client]
4. **Durabilité:** [Objectif ESG]

### Positionnement Cible
- **Marché:** [Positionnement marché souhaité]
- **Technologique:** [Leadership technologique]
- **Organisationnel:** [Modèle organisationnel cible]

### Facteurs Clés de Succès
- [FCS 1: Description et métriques]
- [FCS 2: Description et métriques]
- [FCS 3: Description et métriques]

### Indicateurs de Réussite
| KPI | Valeur Actuelle | Cible 2025 | Cible 2030 |
|-----|-----------------|-------------|-------------|
| [Métrique 1] | [Valeur] | [Cible] | [Cible] |
| [Métrique 2] | [Valeur] | [Cible] | [Cible] |`,
    }

    return (
      templates[sectionId] ||
      `# ${REPORT_SECTIONS.find((s) => s.id === sectionId)?.title}

[Contenu à développer selon la méthodologie ${this.getApplicableMethodologies(REPORT_SECTIONS.find((s) => s.id === sectionId)?.order || 1).join(", ")}]

## Points Clés à Traiter
- [Point 1]
- [Point 2]
- [Point 3]

## Livrables Attendus
- [Livrable 1]
- [Livrable 2]

## Méthodologies Applicables
${this.getApplicableMethodologies(REPORT_SECTIONS.find((s) => s.id === sectionId)?.order || 1)
  .map((m) => `- ${m}`)
  .join("\n")}`
    )
  }

  // Get applicable methodologies for a section
  private getApplicableMethodologies(sectionOrder: number): string[] {
    const methodologies: string[] = []

    METHODOLOGIES.forEach((methodology) => {
      if (methodology.applicableSections.includes(sectionOrder)) {
        methodologies.push(methodology.name)
      }
    })

    // Add compliance frameworks for security section
    if (sectionOrder === 12) {
      COMPLIANCE_FRAMEWORKS.forEach((framework) => {
        methodologies.push(framework.name)
      })
    }

    return methodologies
  }

  // Update section content
  updateSection(reportId: string, sectionId: string, content: string): boolean {
    const report = this.reports.get(reportId)
    if (!report) return false

    const section = report.sections.find((s) => s.id === sectionId)
    if (!section) return false

    section.content = content
    section.completed = content.length > 100 // Basic completion check
    report.updatedAt = new Date()

    return true
  }

  // Get report by ID
  getReport(reportId: string): Report | undefined {
    return this.reports.get(reportId)
  }

  // Get all reports
  getAllReports(): Report[] {
    return Array.from(this.reports.values())
  }

  // Generate report progress
  getReportProgress(reportId: string): { completed: number; total: number; percentage: number } {
    const report = this.reports.get(reportId)
    if (!report) return { completed: 0, total: 0, percentage: 0 }

    const completed = report.sections.filter((s) => s.completed).length
    const total = report.sections.length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
  }

  // Export report to markdown
  exportToMarkdown(reportId: string): string {
    const report = this.reports.get(reportId)
    if (!report) return ""

    let markdown = `# ${report.title}\n\n`
    markdown += `**Client:** ${report.client}\n`
    markdown += `**Consultant:** ${report.metadata.consultant}\n`
    markdown += `**Date:** ${report.createdAt.toLocaleDateString("fr-FR")}\n`
    markdown += `**Statut:** ${report.status}\n\n`
    markdown += `---\n\n`

    // Add sections in order
    const sortedSections = report.sections.sort((a, b) => a.order - b.order)

    sortedSections.forEach((section) => {
      markdown += `${section.content}\n\n`

      if (section.methodology && section.methodology.length > 0) {
        markdown += `*Méthodologies appliquées: ${section.methodology.join(", ")}*\n\n`
      }

      markdown += `---\n\n`
    })

    return markdown
  }
}

// Singleton instance
export const documentEngine = new DocumentEngine()
