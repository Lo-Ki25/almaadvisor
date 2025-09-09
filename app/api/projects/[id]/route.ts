import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Helper function for safe JSON parsing
function safeJsonParse(jsonString: string, fallback: any = null) {
  try {
    console.log('Parsing JSON string:', jsonString)
    const result = JSON.parse(jsonString)
    console.log('JSON parsed successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to parse JSON:', jsonString, 'Error:', error)
    console.log('Using fallback value:', fallback)
    return fallback
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    console.log(`GET /api/projects/${projectId} - Starting request`)
    
    // Récupérer le projet depuis la base de données
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            documents: true,
            chunks: true
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            size: true,
            mime: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        chunks: {
          select: {
            id: true,
            text: true,
            page: true,
            metadata: true,
            document: {
              select: {
                name: true
              }
            }
          },
          take: 10, // Prendre seulement les 10 premiers pour performance
          orderBy: {
            id: 'asc'
          }
        }
      }
    })
    
    if (!project) {
      console.warn(`Project ${projectId} not found in database`)
      return NextResponse.json(
        { 
          error: "Project not found",
          projectId 
        },
        { status: 404 }
      )
    }
    
    console.log(`Found project: ${project.title}`)
    
    // Compter les embeddings
    const embeddingsCount = await db.chunk.count({
      where: { 
        projectId,
        embedding: { not: null }
      }
    })
    
    // Vérifier le rapport
    const report = await db.report.findUnique({
      where: { projectId }
    })
    
    // Déterminer le statut basé sur les données disponibles
    let status = project.status
    if (report) {
      status = 'generated'
    } else if (embeddingsCount > 0) {
      status = 'embedded'
    } else if (project._count.chunks > 0) {
      status = 'ingested'
    } else if (project._count.documents > 0) {
      status = 'uploaded'
    }
    
    const projectResponse = {
      id: project.id,
      title: project.title,
      client: project.client,
      lead: project.lead,
      language: project.language,
      committee: project.committee,
      style: project.style,
      methodologies: project.methodologies ? safeJsonParse(project.methodologies, []) : [],
      ragOptions: project.ragOptions ? safeJsonParse(project.ragOptions, {}) : {},
      status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      documents: project.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.mime,
        status: doc.status,
        createdAt: doc.createdAt.toISOString()
      })),
      chunks: project.chunks.map((chunk, index) => ({
        id: chunk.id,
        content: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''), // Preview seulement
        page: chunk.page,
        metadata: chunk.metadata ? safeJsonParse(chunk.metadata, {}) : {},
        document: {
          name: chunk.document.name
        }
      })),
      citations: [], // Pour l'instant pas implémenté
      diagrams: [], // Sera chargé depuis le rapport si nécessaire
      tables: [], // Pour l'instant pas implémenté
      report: report ? {
        id: report.id,
        markdown: report.markdown.substring(0, 500) + (report.markdown.length > 500 ? '...' : ''), // Preview
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString()
      } : null,
      _count: {
        documents: project._count.documents,
        chunks: project._count.chunks,
        embeddings: embeddingsCount
      }
    }
    
    console.log(`Returning project with ${projectResponse._count.documents} documents, ${projectResponse._count.chunks} chunks, ${projectResponse._count.embeddings} embeddings`)
    return NextResponse.json(projectResponse)
    
  } catch (error) {
    console.error(`Error fetching project ${params.id}:`, error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: "Failed to fetch project",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
