import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { DiagramGeneratorFactory } from '@/lib/diagram-generators'

interface DiagnosticResult {
  projectId: string
  projectTitle: string
  timestamp: string
  status: 'healthy' | 'warning' | 'error'
  summary: {
    totalDocuments: number
    processedDocuments: number
    totalChunks: number
    embeddedChunks: number
    hasReport: boolean
    diagramsGenerated: number
    errors: string[]
    warnings: string[]
  }
  recommendations: string[]
  details: {
    documents: any[]
    chunks: any[]
    embeddings: any[]
    report: any
    diagrams: any[]
  }
}

// Utiliser /tmp en production (Vercel) et le répertoire local en développement
const isProduction = process.env.NODE_ENV === 'production'
const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')
const UPLOADS_DIR = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads')

async function getProjectFolders() {
  try {
    const folders = await fs.readdir(PROJECTS_DIR)
    const projectFolders = []
    
    for (const folder of folders) {
      try {
        const stat = await fs.stat(path.join(PROJECTS_DIR, folder))
        if (stat.isDirectory()) {
          projectFolders.push(folder)
        }
      } catch {
        // Ignore errors for individual folders
      }
    }
    
    return projectFolders
  } catch (error) {
    return []
  }
}

async function loadProjectData(projectId: string) {
  const projectPath = path.join(PROJECTS_DIR, projectId)
  
  try {
    // Charger les métadonnées du projet
    const projectFile = path.join(projectPath, 'project.json')
    let projectData = {}
    try {
      const data = await fs.readFile(projectFile, 'utf-8')
      projectData = JSON.parse(data)
    } catch {}

    // Charger les documents
    let documents = []
    try {
      const documentsFile = path.join(projectPath, 'documents.json')
      const data = await fs.readFile(documentsFile, 'utf-8')
      documents = JSON.parse(data)
    } catch {}

    // Charger les chunks
    let chunks = []
    try {
      const chunksFile = path.join(projectPath, 'chunks.json')
      const data = await fs.readFile(chunksFile, 'utf-8')
      chunks = JSON.parse(data)
    } catch {}

    // Charger les embeddings
    let embeddings = []
    try {
      const embeddingsFile = path.join(projectPath, 'embeddings.json')
      const data = await fs.readFile(embeddingsFile, 'utf-8')
      embeddings = JSON.parse(data)
    } catch {}

    // Charger le rapport
    let report = null
    try {
      const reportFile = path.join(projectPath, 'report.json')
      const data = await fs.readFile(reportFile, 'utf-8')
      report = JSON.parse(data)
    } catch {}

    return { projectData, documents, chunks, embeddings, report }
  } catch (error) {
    console.error(`Erreur lors du chargement du projet ${projectId}:`, error)
    return { projectData: {}, documents: [], chunks: [], embeddings: [], report: null }
  }
}

function generateRecommendations(summary: any, details: any): string[] {
  const recommendations: string[] = []

  // Recommandations sur les documents
  if (summary.totalDocuments === 0) {
    recommendations.push("📁 Aucun document trouvé. Uploadez des documents pour commencer l'analyse.")
  } else if (summary.processedDocuments < summary.totalDocuments) {
    const unprocessed = summary.totalDocuments - summary.processedDocuments
    recommendations.push(`📄 ${unprocessed} document(s) non traité(s). Relancez l'ingestion avec POST /api/ingest`)
  }

  // Recommandations sur les chunks
  if (summary.totalChunks === 0 && summary.totalDocuments > 0) {
    recommendations.push("🔪 Aucun chunk créé. Les documents doivent être découpés en segments plus petits.")
  } else if (summary.totalChunks > 0 && summary.embeddedChunks < summary.totalChunks) {
    const unembedded = summary.totalChunks - summary.embeddedChunks
    recommendations.push(`🧠 ${unembedded} chunk(s) sans embedding. Lancez l'embedding avec POST /api/embed`)
  }

  // Recommandations sur le rapport
  if (!summary.hasReport && summary.embeddedChunks > 0) {
    recommendations.push("📊 Aucun rapport généré. Créez un rapport avec POST /api/generate")
  } else if (summary.hasReport && summary.diagramsGenerated === 0) {
    recommendations.push("📈 Rapport sans diagrammes. Vérifiez les templates de diagrammes dans l'administration.")
  }

  // Recommandations sur les erreurs
  if (summary.errors.length > 0) {
    recommendations.push("🚨 Des erreurs ont été détectées. Consultez les logs pour plus de détails.")
  }

  // Recommandations sur la performance
  if (summary.totalChunks > 1000) {
    recommendations.push("⚡ Projet volumineux détecté. Considérez l'optimisation des embeddings.")
  }

  // Si tout va bien
  if (recommendations.length === 0) {
    recommendations.push("✅ Projet en bon état. Tous les composants sont fonctionnels.")
  }

  return recommendations
}

async function checkDiagramTemplates() {
  try {
    const supportedTypes = DiagramGeneratorFactory.getSupportedTypes()
    const workingTypes = []
    const brokenTypes = []

    for (const type of supportedTypes) {
      try {
        const mockProject = { title: "Test Project", client: "Test Client" }
        DiagramGeneratorFactory.generateDiagram(type, "test context", mockProject)
        workingTypes.push(type)
      } catch (error) {
        brokenTypes.push({ type, error: error.message })
      }
    }

    return { workingTypes, brokenTypes }
  } catch (error) {
    return { workingTypes: [], brokenTypes: [] }
  }
}

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

    // Charger les données du projet
    const { projectData, documents, chunks, embeddings, report } = await loadProjectData(projectId)

    // Calculer les métriques
    const totalDocuments = documents.length
    const processedDocuments = documents.filter(doc => doc.status === 'processed' || doc.chunks?.length > 0).length
    const totalChunks = chunks.length
    const embeddedChunks = embeddings.length
    const hasReport = !!report
    const diagramsGenerated = report?.diagrams?.length || 0

    // Identifier les erreurs et avertissements
    const errors: string[] = []
    const warnings: string[] = []

    documents.forEach(doc => {
      if (doc.status === 'error') {
        errors.push(`Document "${doc.name}": ${doc.error || 'Erreur inconnue'}`)
      }
    })

    if (totalDocuments > 0 && processedDocuments === 0) {
      errors.push('Aucun document n\'a pu être traité')
    }

    if (totalChunks > 0 && embeddedChunks === 0) {
      warnings.push('Aucun embedding généré')
    }

    // Vérifier les templates de diagrammes
    const { workingTypes, brokenTypes } = await checkDiagramTemplates()
    if (brokenTypes.length > 0) {
      brokenTypes.forEach(broken => {
        errors.push(`Template de diagramme "${broken.type}": ${broken.error}`)
      })
    }

    // Déterminer le statut global
    let status: 'healthy' | 'warning' | 'error' = 'healthy'
    if (errors.length > 0) {
      status = 'error'
    } else if (warnings.length > 0 || processedDocuments < totalDocuments || embeddedChunks < totalChunks) {
      status = 'warning'
    }

    const summary = {
      totalDocuments,
      processedDocuments,
      totalChunks,
      embeddedChunks,
      hasReport,
      diagramsGenerated,
      errors,
      warnings
    }

    const diagnostic: DiagnosticResult = {
      projectId,
      projectTitle: projectData.title || projectId,
      timestamp: new Date().toISOString(),
      status,
      summary,
      recommendations: generateRecommendations(summary, { projectData, documents, chunks, embeddings, report }),
      details: {
        documents: documents.map(doc => ({
          name: doc.name,
          status: doc.status,
          chunks: doc.chunks?.length || 0,
          size: doc.size,
          lastModified: doc.lastModified
        })),
        chunks: chunks.map(chunk => ({
          id: chunk.id,
          documentName: chunk.documentName,
          hasEmbedding: embeddings.some(e => e.chunkId === chunk.id)
        })),
        embeddings: embeddings.map(emb => ({
          chunkId: emb.chunkId,
          vectorSize: emb.embedding?.length || 0
        })),
        report: report ? {
          hasContent: !!report.markdown,
          hasDiagrams: report.diagrams?.length || 0,
          generatedAt: report.generatedAt
        } : null,
        diagrams: {
          workingTemplates: workingTypes,
          brokenTemplates: brokenTypes
        }
      }
    }

    return NextResponse.json(diagnostic)
  } catch (error) {
    console.error('Erreur lors du diagnostic:', error)
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic du projet' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Diagnostic global de tous les projets
    const projectFolders = await getProjectFolders()
    const diagnostics: DiagnosticResult[] = []

    for (const projectId of projectFolders) {
      const { projectData, documents, chunks, embeddings, report } = await loadProjectData(projectId)
      
      const totalDocuments = documents.length
      const processedDocuments = documents.filter(doc => doc.status === 'processed').length
      const totalChunks = chunks.length
      const embeddedChunks = embeddings.length
      const hasReport = !!report
      const diagramsGenerated = report?.diagrams?.length || 0

      const errors: string[] = []
      const warnings: string[] = []

      documents.forEach(doc => {
        if (doc.status === 'error') {
          errors.push(`Document "${doc.name}": ${doc.error || 'Erreur inconnue'}`)
        }
      })

      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      if (errors.length > 0) {
        status = 'error'
      } else if (warnings.length > 0 || processedDocuments < totalDocuments) {
        status = 'warning'
      }

      const summary = {
        totalDocuments,
        processedDocuments,
        totalChunks,
        embeddedChunks,
        hasReport,
        diagramsGenerated,
        errors,
        warnings
      }

      diagnostics.push({
        projectId,
        projectTitle: projectData.title || projectId,
        timestamp: new Date().toISOString(),
        status,
        summary,
        recommendations: generateRecommendations(summary, { projectData, documents, chunks, embeddings, report }),
        details: {
          documents: documents.map(doc => ({
            name: doc.name,
            status: doc.status,
            chunks: doc.chunks?.length || 0
          })),
          chunks: chunks.map(chunk => ({ id: chunk.id, documentName: chunk.documentName })),
          embeddings: embeddings.map(emb => ({ chunkId: emb.chunkId })),
          report: report ? { hasContent: !!report.markdown } : null,
          diagrams: []
        }
      })
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalProjects: diagnostics.length,
      healthyProjects: diagnostics.filter(d => d.status === 'healthy').length,
      warningProjects: diagnostics.filter(d => d.status === 'warning').length,
      errorProjects: diagnostics.filter(d => d.status === 'error').length,
      projects: diagnostics
    })
  } catch (error) {
    console.error('Erreur lors du diagnostic global:', error)
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic global' },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
