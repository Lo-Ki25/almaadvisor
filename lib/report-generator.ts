import { db } from "@/lib/db"
import { RAGRetriever } from "@/lib/rag-retriever"
import { REPORT_SECTIONS } from "@/lib/report-sections"
import { DiagramGeneratorFactory } from "@/lib/diagram-generators"
import { TableGeneratorFactory } from "@/lib/table-generators"
import { LLMProviderFactory, type LLMProvider } from "@/lib/llm-providers"

export class ReportGenerator {
  private retriever: RAGRetriever
  private llmProvider?: LLMProvider

  constructor() {
    this.retriever = new RAGRetriever()

    // Initialize LLM provider if configured
    const provider = process.env.LLM_PROVIDER
    if (provider && this.getApiKey(provider)) {
      this.llmProvider = LLMProviderFactory.createProvider(provider, this.getApiKey(provider)!)
    }
  }

  private getApiKey(provider: string): string | undefined {
    switch (provider.toLowerCase()) {
      case "openai":
        return process.env.OPENAI_API_KEY
      case "anthropic":
        return process.env.ANTHROPIC_API_KEY
      case "groq":
        return process.env.GROQ_API_KEY
      default:
        return undefined
    }
  }

  async generateReport(projectId: string): Promise<string> {
    // Get project data
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        chunks: true,
        diagrams: true,
        tables: true,
      },
    })

    if (!project) {
      throw new Error("Project not found")
    }

    const methodologies = project.methodologies ? JSON.parse(project.methodologies) : []
    const ragOptions = project.ragOptions ? JSON.parse(project.ragOptions) : { topK: 8 }

    let reportMarkdown = ""
    const allCitations: Array<{
      docId: string
      docName: string
      page: number
      snippet: string
      section: string
    }> = []

    // Generate each section
    for (const section of REPORT_SECTIONS) {
      console.log(`Generating section: ${section.title}`)

      try {
        const sectionContent = await this.generateSection(projectId, section, project, methodologies, ragOptions.topK)

        reportMarkdown += sectionContent + "\n\n---\n\n"

        // Extract citations for this section
        try {
          const retrievalResults = await this.retriever.retrieveBySection(
            projectId,
            section.keywords,
            Math.ceil(ragOptions.topK / 2),
          )

          const sectionCitations = this.retriever.extractCitations(retrievalResults)
          sectionCitations.forEach((citation) => {
            allCitations.push({
              ...citation,
              section: section.title,
            })
          })
        } catch (error) {
          console.error(`Error extracting citations for section ${section.id}:`, error)
        }
      } catch (error) {
        console.error(`Error generating section ${section.id}:`, error)
        reportMarkdown += `# ${section.title}\n\n*Section en cours de génération...*\n\n---\n\n`
      }
    }

    // Generate and save diagrams
    try {
      await this.generateDiagrams(projectId, project, methodologies)
    } catch (error) {
      console.error("Error generating diagrams:", error)
    }

    // Generate and save tables
    try {
      await this.generateTables(projectId, project, methodologies)
    } catch (error) {
      console.error("Error generating tables:", error)
    }

    // Save citations
    try {
      await this.saveCitations(projectId, allCitations)
    } catch (error) {
      console.error("Error saving citations:", error)
    }

    // Save the complete report
    try {
      await db.report.upsert({
        where: { projectId },
        update: {
          markdown: reportMarkdown,
          updatedAt: new Date(),
        },
        create: {
          projectId,
          markdown: reportMarkdown,
        },
      })
    } catch (error) {
      console.error("Error saving report:", error)
    }

    // Update project status
    try {
      await db.project.update({
        where: { id: projectId },
        data: {
          status: "generated",
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error("Error updating project status:", error)
    }

    return reportMarkdown
  }

  private async generateSection(
    projectId: string,
    section: any,
    project: any,
    methodologies: string[],
    topK: number,
  ): Promise<string> {
    // Retrieve relevant context
    let context = "Contexte à définir basé sur les documents fournis."
    try {
      const retrievalResults = await this.retriever.retrieveBySection(projectId, section.keywords, topK)
      context = this.retriever.formatRetrievalContext(retrievalResults)
    } catch (error) {
      console.error(`Error retrieving context for section ${section.id}:`, error)
    }

    // Prepare template variables
    const templateVars = {
      title: project.title,
      client: project.client || "Client",
      lead: project.lead || "Consultant",
      date: new Date().toLocaleDateString("fr-FR"),
      language: project.language,
      context: context,
      methodologies: methodologies.join(", "),
      recommendations: "Recommandations basées sur l'analyse des documents fournis.",
      keyPoints: "Points clés identifiés lors de l'audit.",
      currentSituation: "Situation actuelle analysée à partir des documents.",
      challenges: "Enjeux et défis identifiés.",
      objectives: "Objectifs du projet de transformation.",
      methodology: "Méthodologie d'audit appliquée.",
      technicalFindings: "Constats techniques identifiés.",
      organizationalFindings: "Constats organisationnels.",
      improvements: "Points d'amélioration identifiés.",
      benchmarks: "Référentiels et bonnes pratiques analysés.",
      gaps: "Écarts identifiés par rapport aux standards.",
      bestPractices: "Bonnes pratiques recommandées.",
      vision: "Vision stratégique du projet.",
      businessModel: "Modèle économique proposé.",
      valueProposition: "Proposition de valeur.",
      c4Context: "Architecture de contexte (C4).",
      c4Containers: "Architecture des conteneurs (C4).",
      c4Components: "Architecture des composants (C4).",
      nfr: "Exigences non fonctionnelles.",
      processMap: "Cartographie des processus.",
      bpmnDiagrams: "Diagrammes de processus métier.",
      optimizations: "Optimisations proposées.",
      owaspFramework: "Cadre de sécurité OWASP.",
      gdprCompliance: "Conformité RGPD et Loi 09-08.",
      strideAnalysis: "Analyse des risques STRIDE.",
      securityMeasures: "Mesures de sécurité recommandées.",
      riceAnalysis: "Analyse de priorisation RICE.",
      ganttChart: "Planning de projet (Gantt).",
      phases: "Phases et jalons du projet.",
      budgetEstimate: "Estimation budgétaire.",
      capexOpex: "Répartition CAPEX/OPEX.",
      unitEconomics: "Économie unitaire.",
      roi: "Retour sur investissement.",
      orgStructure: "Structure organisationnelle.",
      raciMatrix: "Matrice RACI.",
      decisionProcess: "Processus de décision.",
      balancedScorecard: "Tableau de bord équilibré.",
      sreMetrics: "Métriques SRE (SLI/SLO).",
      dashboards: "Tableaux de bord.",
      fairAnalysis: "Analyse des risques FAIR.",
      riskMatrix: "Matrice des risques.",
      mitigationPlans: "Plans de mitigation.",
      nextSteps: "Prochaines étapes.",
      callToAction: "Appel à décision.",
      diagrams: "Diagrammes techniques.",
      dataTables: "Tableaux de données.",
      checklists: "Checklists de conformité.",
    }

    // Generate content using LLM if available, otherwise use template
    let content = section.template

    if (this.llmProvider && context && context !== "Contexte à définir basé sur les documents fournis.") {
      try {
        const prompt = this.buildSectionPrompt(section, context, templateVars, methodologies)
        const generatedContent = await this.llmProvider.generateText(prompt, {
          maxTokens: 1500,
          temperature: 0.7,
        })

        if (generatedContent.trim()) {
          content = generatedContent
        }
      } catch (error) {
        console.error(`Error generating content for section ${section.id}:`, error)
        // Fallback to template
      }
    }

    // Replace template variables
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      content = content.replace(regex, String(value))
    })

    return content
  }

  private buildSectionPrompt(section: any, context: string, templateVars: any, methodologies: string[]): string {
    return `Tu es un consultant senior spécialisé en transformation digitale. 

Rédige la section "${section.title}" d'un dossier institutionnel pour le projet "${templateVars.title}" du client "${templateVars.client}".

Méthodologies à appliquer : ${methodologies.join(", ")}

Contexte extrait des documents :
${context}

Instructions :
- Style professionnel niveau cabinet de conseil (McKinsey/BCG)
- Paragraphes courts et percutants
- Utilise les citations [[NomDoc:page]] présentes dans le contexte
- Ajoute des encadrés "Points clés" si pertinent
- Chiffres en gras quand disponibles
- Maximum 800 mots
- Langue : ${templateVars.language}

Génère uniquement le contenu de la section, sans titre principal (il sera ajouté automatiquement).`
  }

  private async generateDiagrams(projectId: string, project: any, methodologies: string[]): Promise<void> {
    const diagramTypes = ["c4-context", "bpmn", "gantt", "stride"]

    for (const type of diagramTypes) {
      try {
        const mermaidCode = DiagramGeneratorFactory.generateDiagram(type, "", project)

        await db.diagram.create({
          data: {
            projectId,
            kind: type,
            title: this.getDiagramTitle(type),
            mermaid: mermaidCode,
          },
        })
      } catch (error) {
        console.error(`Error generating ${type} diagram:`, error)
        // Create a placeholder diagram if generation fails
        await db.diagram.create({
          data: {
            projectId,
            kind: type,
            title: this.getDiagramTitle(type),
            mermaid: `graph TD\n    A[${type} Diagram]\n    B[Placeholder]\n    A --> B`,
          },
        })
      }
    }
  }

  private async generateTables(projectId: string, project: any, methodologies: string[]): Promise<void> {
    const tableTypes = ["RICE", "Budget", "RACI", "BSC"]

    for (const type of tableTypes) {
      try {
        const csvData = TableGeneratorFactory.generateTable(type, "", project)

        await db.dataTable.create({
          data: {
            projectId,
            name: type,
            csv: csvData,
          },
        })
      } catch (error) {
        console.error(`Error generating ${type} table:`, error)
        // Create a placeholder table if generation fails
        await db.dataTable.create({
          data: {
            projectId,
            name: type,
            csv: `Item,Value\n${type} Table,Placeholder`,
          },
        })
      }
    }
  }

  private async saveCitations(projectId: string, citations: any[]): Promise<void> {
    // Remove existing citations for this project
    await db.citation.deleteMany({
      where: { projectId },
    })

    // Save new citations
    for (const citation of citations) {
      try {
        await db.citation.create({
          data: {
            projectId,
            docId: citation.docId,
            page: citation.page,
            snippet: citation.snippet,
            section: citation.section,
            confidence: 0.8, // Default confidence
          },
        })
      } catch (error) {
        console.error("Error saving citation:", error)
      }
    }
  }

  private getDiagramTitle(type: string): string {
    const titles: Record<string, string> = {
      "c4-context": "Architecture - Vue Contexte (C4)",
      bpmn: "Processus Métier (BPMN)",
      gantt: "Planning Projet (Gantt)",
      stride: "Analyse des Risques (STRIDE)",
    }
    return titles[type] || type
  }
}
