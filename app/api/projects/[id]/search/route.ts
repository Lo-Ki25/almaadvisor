import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { RAGRetriever } from "@/lib/rag-retriever"
import { z } from "zod"

const searchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().min(1).max(20).default(8),
  minSimilarity: z.number().min(0).max(1).default(0.3),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { query, topK, minSimilarity } = searchSchema.parse(body)

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const retriever = new RAGRetriever()
    const results = await retriever.retrieveRelevantChunks(projectId, query, topK, minSimilarity)

    const context = retriever.formatRetrievalContext(results)
    const citations = retriever.extractCitations(results)

    return NextResponse.json({
      query,
      results,
      context,
      citations,
      totalResults: results.length,
    })
  } catch (error) {
    console.error("Error searching documents:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search documents" },
      { status: 500 },
    )
  }
}
