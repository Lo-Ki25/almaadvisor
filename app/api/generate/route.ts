import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { DiagramGeneratorFactory } from '@/lib/diagram-generators'
import { db } from '@/lib/db'

// Utiliser /tmp en production (Vercel) et le répertoire local en développement
const isProduction = process.env.NODE_ENV === 'production'
const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')

interface Chunk {
  id: string
  documentId: string
  documentName: string
  content: string
  index: number
  metadata: any
}

interface Embedding {
  chunkId: string
  embedding: number[]
  metadata: any
  createdAt: string
}

interface GeneratedReport {
  id: string
  projectId: string
  title: string
  markdown: string
  diagrams: Array<{
    type: string
    title: string
    mermaidCode: string
  }>
  generatedAt: string
  metadata: {
    totalChunks: number
    analyzedContent: number
    diagramsGenerated: number
    methodology?: string
  }
}

// Lire les chunks d'un projet depuis la base de données
async function loadChunks(projectId: string): Promise<Chunk[]> {
  try {
    console.log(`Loading chunks for project: ${projectId}`)
    const chunks = await db.chunk.findMany({
      where: { projectId },
      include: {
        document: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`Found ${chunks.length} chunks from database`)
    
    // Convertir au format attendu
    const convertedChunks: Chunk[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      documentId: chunk.docId,
      documentName: chunk.document.name,
      content: chunk.text,
      index,
      metadata: chunk.metadata ? JSON.parse(chunk.metadata) : {}
    }))
    
    return convertedChunks
  } catch (error) {
    console.error(`Error loading chunks for project ${projectId}:`, error)
    return []
  }
}

// Lire les embeddings d'un projet depuis la base de données
async function loadEmbeddings(projectId: string): Promise<Embedding[]> {
  try {
    console.log(`Loading embeddings for project: ${projectId}`)
    const chunks = await db.chunk.findMany({
      where: { 
        projectId,
        embedding: { not: null }
      },
      select: {
        id: true,
        embedding: true,
        metadata: true
      }
    })
    
    console.log(`Found ${chunks.length} embeddings from database`)
    
    // Convertir au format attendu
    const embeddings: Embedding[] = chunks.map(chunk => ({
      chunkId: chunk.id,
      embedding: chunk.embedding ? Array.from(new Float32Array(chunk.embedding.buffer)) : [],
      metadata: chunk.metadata ? JSON.parse(chunk.metadata) : {},
      createdAt: new Date().toISOString()
    }))
    
    return embeddings
  } catch (error) {
    console.error(`Error loading embeddings for project ${projectId}:`, error)
    return []
  }
}

// Lire les métadonnées du projet depuis la base de données
async function loadProjectData(projectId: string): Promise<any> {
  try {
    console.log(`Loading project data for: ${projectId}`)
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        _count: {
          select: {
            documents: true,
            chunks: true
          }
        }
      }
    })
    
    if (!project) {
      console.warn(`Project ${projectId} not found in database`)
      return { id: projectId, title: projectId, client: 'Client' }
    }
    
    console.log(`Loaded project: ${project.title}`)
    
    return {
      id: project.id,
      title: project.title,
      client: project.client || 'Client',
      lead: project.lead,
      language: project.language,
      committee: project.committee,
      style: project.style,
      methodologies: project.methodologies ? JSON.parse(project.methodologies) : [],
      ragOptions: project.ragOptions ? JSON.parse(project.ragOptions) : {},
      documents: project.documents,
      counts: project._count
    }
  } catch (error) {
    console.error(`Error loading project data for ${projectId}:`, error)
    return { id: projectId, title: projectId, client: 'Client' }
  }
}

// Sauvegarder le rapport généré dans la base de données et fichier
async function saveReport(projectId: string, report: GeneratedReport): Promise<void> {
  try {
    console.log(`Saving report for project: ${projectId}`)
    
    // Sauvegarder dans la base de données Prisma
    await db.report.upsert({
      where: { projectId },
      create: {
        id: report.id,
        projectId,
        markdown: report.markdown
      },
      update: {
        markdown: report.markdown,
        updatedAt: new Date()
      }
    })
    
    // Aussi sauvegarder dans le fichier pour compatibilité
    const projectPath = path.join(PROJECTS_DIR, projectId)
    await fs.mkdir(projectPath, { recursive: true })
    const reportFile = path.join(projectPath, 'report.json')
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2))
    
    console.log(`Report saved successfully for project: ${projectId}`)
  } catch (error) {
    console.error(`Error saving report for project ${projectId}:`, error)
    throw error
  }
}

// Lire le rapport existant depuis la base de données
async function loadReport(projectId: string): Promise<GeneratedReport | null> {
  try {
    console.log(`Loading existing report for project: ${projectId}`)
    
    // D'abord essayer de lire depuis la base de données
    const report = await db.report.findUnique({
      where: { projectId }
    })
    
    if (report) {
      console.log(`Report found in database for project: ${projectId}`)
      return {
        id: report.id,
        projectId: report.projectId,
        title: `Rapport d'Analyse - Project ${projectId}`,
        markdown: report.markdown,
        diagrams: [],
        generatedAt: report.createdAt.toISOString(),
        metadata: {
          totalChunks: 0,
          analyzedContent: 0,
          diagramsGenerated: 0
        }
      }
    }
    
    // Fallback: essayer de lire depuis le fichier
    const projectPath = path.join(PROJECTS_DIR, projectId)
    const reportFile = path.join(projectPath, 'report.json')
    const data = await fs.readFile(reportFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log(`No existing report found for project: ${projectId}`)
    return null
  }
}

// Analyser le contenu et extraire des insights
function analyzeContent(chunks: Chunk[]): any {
  const totalContent = chunks.map(c => c.content).join(' ')
  
  // Analyse basique du contenu
  const wordCount = totalContent.split(/\s+/).length
  const documentTypes = [...new Set(chunks.map(c => c.metadata?.documentType || 'unknown'))]
  
  // Identifier des concepts clés (simulation)
  const concepts = {
    architecture: /architecture|système|composant|service|api/gi.test(totalContent),
    security: /sécurité|authentification|autorisation|chiffrement/gi.test(totalContent),
    process: /processus|workflow|étape|procédure/gi.test(totalContent),
    data: /données|base|stockage|modèle/gi.test(totalContent),
    business: /métier|business|client|utilisateur/gi.test(totalContent)
  }
  
  return {
    wordCount,
    documentTypes,
    concepts,
    keyTopics: Object.keys(concepts).filter(key => concepts[key])
  }
}

// Générer les diagrammes appropriés
async function generateDiagrams(projectData: any, analysis: any): Promise<Array<{ type: string; title: string; mermaidCode: string }>> {
  const diagrams = []
  const supportedTypes = DiagramGeneratorFactory.getSupportedTypes()
  
  try {
    // Diagramme d'architecture (toujours généré)
    if (supportedTypes.includes('c4-context')) {
      const mermaidCode = DiagramGeneratorFactory.generateDiagram('c4-context', '', projectData)
      diagrams.push({
        type: 'c4-context',
        title: 'Architecture - Vue Contexte',
        mermaidCode
      })
    }
    
    // Diagramme de processus si pertinent
    if (analysis.concepts.process && supportedTypes.includes('flowchart')) {
      const mermaidCode = DiagramGeneratorFactory.generateDiagram('flowchart', '', projectData)
      diagrams.push({
        type: 'flowchart',
        title: 'Processus Métier',
        mermaidCode
      })
    }
    
    // Diagramme de séquence pour les interactions
    if (analysis.concepts.architecture && supportedTypes.includes('sequence')) {
      const mermaidCode = DiagramGeneratorFactory.generateDiagram('sequence', '', projectData)
      diagrams.push({
        type: 'sequence',
        title: 'Interactions Système',
        mermaidCode
      })
    }
    
    // Diagramme de composants si architecture technique
    if (analysis.concepts.architecture && supportedTypes.includes('c4-component')) {
      const mermaidCode = DiagramGeneratorFactory.generateDiagram('c4-component', '', projectData)
      diagrams.push({
        type: 'c4-component',
        title: 'Architecture - Composants',
        mermaidCode
      })
    }
    
    // Diagramme de classes si modélisation de données
    if (analysis.concepts.data && supportedTypes.includes('class')) {
      const mermaidCode = DiagramGeneratorFactory.generateDiagram('class', '', projectData)
      diagrams.push({
        type: 'class',
        title: 'Modèle de Données',
        mermaidCode
      })
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération des diagrammes:', error)
  }
  
  return diagrams
}

// Générer le contenu markdown du rapport
function generateMarkdownReport(projectData: any, analysis: any, diagrams: any[]): string {
  const sections = []
  
  // En-tête
  sections.push(`# Rapport d'Analyse - ${projectData.title || projectData.id}`)
  sections.push(`**Client:** ${projectData.client || 'Non spécifié'}`)
  sections.push(`**Date:** ${new Date().toLocaleDateString('fr-FR')}`)
  sections.push(`**Documents analysés:** ${analysis.documentTypes.length} type(s)`)
  sections.push('')
  
  // Résumé exécutif
  sections.push('## Résumé Exécutif')
  sections.push(`Cette analyse porte sur ${analysis.wordCount.toLocaleString()} mots répartis dans les documents du projet.`)
  
  if (analysis.keyTopics.length > 0) {
    sections.push(`Les principaux domaines identifiés sont : ${analysis.keyTopics.join(', ')}.`)
  }
  
  sections.push('')
  
  // Analyse détaillée
  sections.push('## Analyse Détaillée')
  
  if (analysis.concepts.architecture) {
    sections.push('### Architecture Système')
    sections.push('Le projet présente des éléments d\'architecture système avec des composants, services et APIs identifiés.')
    sections.push('')
  }
  
  if (analysis.concepts.security) {
    sections.push('### Sécurité')
    sections.push('Des aspects de sécurité ont été identifiés, incluant authentification et autorisation.')
    sections.push('')
  }
  
  if (analysis.concepts.process) {
    sections.push('### Processus Métier')
    sections.push('Le document décrit des processus métier et des workflows organisationnels.')
    sections.push('')
  }
  
  if (analysis.concepts.data) {
    sections.push('### Gestion des Données')
    sections.push('Le projet implique la gestion de données avec des modèles et bases de données.')
    sections.push('')
  }
  
  // Diagrammes
  if (diagrams.length > 0) {
    sections.push('## Diagrammes')
    
    diagrams.forEach(diagram => {
      sections.push(`### ${diagram.title}`)
      sections.push('```mermaid')
      sections.push(diagram.mermaidCode)
      sections.push('```')
      sections.push('')
    })
  }
  
  // Recommandations
  sections.push('## Recommandations')
  sections.push('Basé sur l\'analyse du contenu, voici les recommandations principales :')
  sections.push('')
  
  if (analysis.concepts.architecture) {
    sections.push('- **Architecture :** Maintenir une documentation claire de l\'architecture système')
  }
  
  if (analysis.concepts.security) {
    sections.push('- **Sécurité :** Renforcer les mesures de sécurité identifiées')
  }
  
  if (analysis.concepts.process) {
    sections.push('- **Processus :** Optimiser les workflows métier décrits')
  }
  
  if (analysis.concepts.data) {
    sections.push('- **Données :** Assurer la gouvernance et la qualité des données')
  }
  
  sections.push('- **Suivi :** Maintenir cette documentation à jour lors des évolutions')
  sections.push('')
  
  // Conclusion
  sections.push('## Conclusion')
  sections.push(`Ce rapport d'analyse fournit une vue d'ensemble complète du projet ${projectData.title || projectData.id}.`)
  sections.push('Les diagrammes et recommandations peuvent servir de base pour les prochaines étapes du projet.')
  
  return sections.join('\n')
}

// POST - Générer un rapport pour un projet
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    console.log(`Début de la génération de rapport pour le projet: ${projectId}`)

    // Charger les données nécessaires
    const chunks = await loadChunks(projectId)
    const embeddings = await loadEmbeddings(projectId)
    const projectData = await loadProjectData(projectId)
    
    if (chunks.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun chunk trouvé pour ce projet',
          projectId,
          message: 'Veuillez d\'abord ingérer les documents avec POST /api/ingest'
        },
        { status: 404 }
      )
    }
    
    if (embeddings.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun embedding trouvé pour ce projet',
          projectId,
          message: 'Veuillez d\'abord générer les embeddings avec POST /api/embed'
        },
        { status: 404 }
      )
    }

    console.log(`Génération rapport: ${chunks.length} chunks, ${embeddings.length} embeddings`)

    // Analyser le contenu
    const analysis = analyzeContent(chunks)
    console.log('Analyse terminée:', analysis)
    
    // Générer les diagrammes
    const diagrams = await generateDiagrams(projectData, analysis)
    console.log(`${diagrams.length} diagrammes générés`)
    
    // Générer le contenu markdown
    const markdown = generateMarkdownReport(projectData, analysis, diagrams)
    
    // Créer le rapport
    const report: GeneratedReport = {
      id: `report-${projectId}-${Date.now()}`,
      projectId,
      title: `Rapport d'Analyse - ${projectData.title || projectId}`,
      markdown,
      diagrams,
      generatedAt: new Date().toISOString(),
      metadata: {
        totalChunks: chunks.length,
        analyzedContent: analysis.wordCount,
        diagramsGenerated: diagrams.length,
        methodology: 'RAG Analysis'
      }
    }

    // Sauvegarder le rapport
    await saveReport(projectId, report)

    const response = {
      message: 'Rapport généré avec succès',
      projectId,
      report: {
        id: report.id,
        title: report.title,
        contentLength: markdown.length,
        diagramsCount: diagrams.length,
        generatedAt: report.generatedAt
      },
      diagrams: diagrams.map(d => ({
        type: d.type,
        title: d.title,
        codeLength: d.mermaidCode.length
      })),
      nextStep: 'Consultez le rapport généré dans l\'interface utilisateur'
    }

    console.log('Rapport généré:', response.report)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du rapport',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Récupérer le rapport existant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    const report = await loadReport(projectId)
    
    if (!report) {
      return NextResponse.json(
        { 
          error: 'Aucun rapport trouvé pour ce projet',
          projectId,
          message: 'Veuillez générer un rapport avec POST /api/generate'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rapport' },
      { status: 500 }
    )
  }
}

// OPTIONS - Support CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
    },
  })
}
