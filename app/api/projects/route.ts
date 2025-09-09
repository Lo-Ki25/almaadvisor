import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

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

const createProjectSchema = z.object({
  title: z.string().min(1),
  client: z.string().optional(),
  lead: z.string().optional(),
  language: z.enum(["FR", "EN", "BILINGUAL"]).default("FR"),
  committee: z.enum(["institutionnel", "technique", "mixte"]).optional(),
  style: z.enum(["cabinet", "pedagogique", "mixte"]).optional(),
  methodologies: z.array(z.string()).optional(),
  ragOptions: z
    .object({
      chunkSize: z.number().default(800),
      overlap: z.number().default(120),
      topK: z.number().default(8),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects - Starting request')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const data = createProjectSchema.parse(body)
    console.log('Validated data:', JSON.stringify(data, null, 2))

    console.log('Creating project in database...')
    const project = await db.project.create({
      data: {
        title: data.title,
        client: data.client,
        lead: data.lead,
        language: data.language,
        committee: data.committee,
        style: data.style,
        methodologies: data.methodologies ? JSON.stringify(data.methodologies) : null,
        ragOptions: data.ragOptions ? JSON.stringify(data.ragOptions) : null,
        status: "draft",
      },
    })
    console.log('Project created successfully:', project.id)

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: "Failed to create project", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('GET /api/projects - Starting request')
    
    // Récupérer tous les projets de la base de données
    const projects = await db.project.findMany({
      include: {
        _count: {
          select: {
            documents: true
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            size: true,
            mime: true,
            status: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    console.log(`Found ${projects.length} projects from database`)
    
    // Enrichir les projets avec les informations du filesystem si disponible
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const fs = await import('fs/promises')
        const path = await import('path')
        
        // Utiliser /tmp en production (Vercel) et le répertoire local en développement
        const isProduction = process.env.NODE_ENV === 'production'
        const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')
        const projectPath = path.join(PROJECTS_DIR, project.id)
        
        // Compter les chunks
        let chunksCount = 0
        try {
          const chunksFile = path.join(projectPath, 'chunks.json')
          const chunksJson = await fs.readFile(chunksFile, 'utf-8')
          const chunks = JSON.parse(chunksJson)
          chunksCount = chunks.length
        } catch {
          // Pas de chunks
        }
        
        // Vérifier les embeddings
        let embeddingsCount = 0
        try {
          const embeddingsFile = path.join(projectPath, 'embeddings.json')
          const embeddingsJson = await fs.readFile(embeddingsFile, 'utf-8')
          const embeddings = JSON.parse(embeddingsJson)
          embeddingsCount = embeddings.length
        } catch {
          // Pas d'embeddings
        }
        
        // Vérifier le rapport
        let hasReport = false
        let reportData: any = null
        try {
          const reportFile = path.join(projectPath, 'report.json')
          const reportJson = await fs.readFile(reportFile, 'utf-8')
          reportData = JSON.parse(reportJson)
          hasReport = true
        } catch {
          // Pas de rapport
        }
        
        // Déterminer le statut basé sur les données disponibles
        let status = project.status // Garder le statut de la DB par défaut
        if (hasReport) {
          status = 'generated'
        } else if (embeddingsCount > 0) {
          status = 'embedded'
        } else if (chunksCount > 0) {
          status = 'ingested'
        } else if (project._count.documents > 0) {
          status = 'uploading'
        }
        
        return {
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
          _count: {
            documents: project._count.documents,
            chunks: chunksCount,
            diagrams: 0 // Pour l'instant
          },
          report: hasReport ? { id: reportData?.id } : null,
          documentsInfo: project.documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.mime,
            status: doc.status
          }))
        }
      })
    )
    
    console.log(`Returning ${enrichedProjects.length} enriched projects`)
    return NextResponse.json(enrichedProjects)
    
  } catch (error) {
    console.error("Error fetching projects:", error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: "Failed to fetch projects",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
