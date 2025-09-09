import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DIAGNOSE] Running diagnostics for project: ${params.id}`)
  
  try {
    const projectId = params.id

    // Get comprehensive project data
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        documents: true,
        chunks: true,
        citations: true,
        diagrams: true,
        tables: true,
        report: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Analyze document statuses
    const documentStatuses = project.documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Analyze chunk embeddings
    const chunksWithEmbeddings = project.chunks.filter(chunk => chunk.embedding !== null).length
    const chunksWithoutEmbeddings = project.chunks.filter(chunk => chunk.embedding === null).length

    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      LLM_PROVIDER: process.env.LLM_PROVIDER || 'Not set',
      UPLOAD_DIR: process.env.UPLOAD_DIR || '/tmp/uploads',
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '52428800',
    }

    const diagnostics = {
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        language: project.language,
        methodologies: project.methodologies ? JSON.parse(project.methodologies) : [],
        ragOptions: project.ragOptions ? JSON.parse(project.ragOptions) : null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      documents: {
        total: project.documents.length,
        statusBreakdown: documentStatuses,
        files: project.documents.map(doc => ({
          name: doc.name,
          status: doc.status,
          mime: doc.mime,
          size: doc.size,
          pages: doc.pages,
          createdAt: doc.createdAt,
        })),
      },
      chunks: {
        total: project.chunks.length,
        withEmbeddings: chunksWithEmbeddings,
        withoutEmbeddings: chunksWithoutEmbeddings,
        embeddingProgress: project.chunks.length > 0 
          ? Math.round((chunksWithEmbeddings / project.chunks.length) * 100) 
          : 0,
      },
      citations: {
        total: project.citations.length,
      },
      diagrams: {
        total: project.diagrams.length,
        types: project.diagrams.reduce((acc, diag) => {
          acc[diag.kind] = (acc[diag.kind] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
      tables: {
        total: project.tables.length,
        types: project.tables.reduce((acc, table) => {
          acc[table.name] = (acc[table.name] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
      report: {
        exists: !!project.report,
        length: project.report?.markdown?.length || 0,
        createdAt: project.report?.createdAt,
        updatedAt: project.report?.updatedAt,
      },
      environment: envCheck,
      recommendations: [],
    }

    // Generate recommendations based on diagnostics
    const recommendations: string[] = []

    if (project.documents.length === 0) {
      recommendations.push("No documents uploaded. Upload documents first.")
    } else if (documentStatuses['uploaded'] > 0) {
      recommendations.push(`${documentStatuses['uploaded']} documents ready for ingestion. Run /ingest endpoint.`)
    }

    if (project.chunks.length === 0 && documentStatuses['processed'] > 0) {
      recommendations.push("Documents processed but no chunks found. Check document parser.")
    }

    if (chunksWithoutEmbeddings > 0) {
      recommendations.push(`${chunksWithoutEmbeddings} chunks without embeddings. Run /embed endpoint.`)
    }

    if (chunksWithEmbeddings > 0 && !project.report) {
      recommendations.push("Embeddings ready. Can generate report using /generate endpoint.")
    }

    if (!envCheck.OPENAI_API_KEY) {
      recommendations.push("OPENAI_API_KEY not configured. Embeddings and LLM generation will fail.")
    }

    if (documentStatuses['error'] > 0) {
      recommendations.push(`${documentStatuses['error']} documents in error state. Check logs for processing issues.`)
    }

    diagnostics.recommendations = recommendations

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error(`[DIAGNOSE] Error:`, error)
    return NextResponse.json({ 
      error: "Diagnostic failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
