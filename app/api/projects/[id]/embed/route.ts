import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { EmbeddingService } from "@/lib/embeddings"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Get project and its chunks
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { chunks: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get chunks that don't have embeddings yet
    const chunksWithoutEmbeddings = await db.chunk.findMany({
      where: {
        projectId,
        embedding: null,
      },
    })

    if (chunksWithoutEmbeddings.length === 0) {
      return NextResponse.json({
        message: "All chunks already have embeddings",
        processedChunks: 0,
      })
    }

    // Initialize embedding service
    const embeddingService = EmbeddingService.getInstance()
    await embeddingService.initialize()

    let processedChunks = 0

    // Process chunks in batches
    const batchSize = 5
    for (let i = 0; i < chunksWithoutEmbeddings.length; i += batchSize) {
      const batch = chunksWithoutEmbeddings.slice(i, i + batchSize)

      for (const chunk of batch) {
        try {
          // Generate embedding
          const embedding = await embeddingService.generateEmbedding(chunk.text)

          // Save embedding to database
          await db.chunk.update({
            where: { id: chunk.id },
            data: {
              embedding: EmbeddingService.serializeEmbedding(embedding),
            },
          })

          processedChunks++

          // Small delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Error generating embedding for chunk ${chunk.id}:`, error)
          // Continue with other chunks
        }
      }
    }

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "embedded",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Embeddings generated successfully",
      processedChunks,
      totalChunks: chunksWithoutEmbeddings.length,
    })
  } catch (error) {
    console.error("Error generating embeddings:", error)

    // Update project status to error
    await db.project
      .update({
        where: { id: params.id },
        data: {
          status: "error",
          updatedAt: new Date(),
        },
      })
      .catch(() => {}) // Ignore errors in error handling

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate embeddings" },
      { status: 500 },
    )
  }
}