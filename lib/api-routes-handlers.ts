import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DocumentParser, TextChunker } from "@/lib/document-parser"
import { EmbeddingService } from "@/lib/embeddings"
import { ReportGenerator } from "@/lib/report-generator"

export class ProjectAPIHandlers {
  static async handleIngest(projectId: string): Promise<NextResponse> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: { documents: true },
      })

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      // Process each document
      for (const document of project.documents) {
        if (document.status !== "uploaded") continue

        try {
          // Parse document
          const parsed = await DocumentParser.parseFile(document.path, document.mime)

          // Create chunks
          const ragOptions = project.ragOptions ? JSON.parse(project.ragOptions) : { chunkSize: 800, overlap: 120 }
          const chunks = TextChunker.chunkText(parsed.text, ragOptions.chunkSize, ragOptions.overlap)

          // Save chunks to database
          for (const chunk of chunks) {
            const page = TextChunker.extractPageFromChunk(chunk.text, chunk.start, parsed.text)

            await db.chunk.create({
              data: {
                projectId,
                documentId: document.id,
                text: chunk.text,
                page,
                startIndex: chunk.start,
                endIndex: chunk.end,
              },
            })
          }

          // Update document status
          await db.document.update({
            where: { id: document.id },
            data: { status: "ingested" },
          })
        } catch (error) {
          console.error(`Error processing document ${document.id}:`, error)
          await db.document.update({
            where: { id: document.id },
            data: { status: "error" },
          })
        }
      }

      // Update project status
      await db.project.update({
        where: { id: projectId },
        data: { status: "ingested" },
      })

      return NextResponse.json({ message: "Documents ingested successfully" })
    } catch (error) {
      console.error("Error in ingest:", error)
      return NextResponse.json({ error: "Failed to ingest documents" }, { status: 500 })
    }
  }

  static async handleEmbed(projectId: string): Promise<NextResponse> {
    try {
      const embeddingService = EmbeddingService.getInstance()

      // Get all chunks without embeddings
      const chunks = await db.chunk.findMany({
        where: {
          projectId,
          embedding: null,
        },
      })

      if (chunks.length === 0) {
        return NextResponse.json({ message: "No chunks to embed" })
      }

      // Generate embeddings for each chunk
      for (const chunk of chunks) {
        try {
          const embedding = await embeddingService.generateEmbedding(chunk.text)
          const serializedEmbedding = EmbeddingService.serializeEmbedding(embedding)

          await db.chunk.update({
            where: { id: chunk.id },
            data: { embedding: serializedEmbedding },
          })
        } catch (error) {
          console.error(`Error embedding chunk ${chunk.id}:`, error)
        }
      }

      // Update project status
      await db.project.update({
        where: { id: projectId },
        data: { status: "embedded" },
      })

      return NextResponse.json({ message: "Embeddings generated successfully" })
    } catch (error) {
      console.error("Error in embed:", error)
      return NextResponse.json({ error: "Failed to generate embeddings" }, { status: 500 })
    }
  }

  static async handleGenerate(projectId: string): Promise<NextResponse> {
    try {
      // Update project status to generating
      await db.project.update({
        where: { id: projectId },
        data: { status: "generating" },
      })

      const reportGenerator = new ReportGenerator()
      const reportMarkdown = await reportGenerator.generateReport(projectId)

      return NextResponse.json({
        message: "Report generated successfully",
        reportId: projectId,
        markdown: reportMarkdown,
      })
    } catch (error) {
      console.error("Error in generate:", error)

      // Update project status to error
      await db.project.update({
        where: { id: projectId },
        data: { status: "error" },
      })

      return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
    }
  }

  static async handleSearch(projectId: string, query: string): Promise<NextResponse> {
    try {
      const embeddingService = EmbeddingService.getInstance()
      const queryEmbedding = await embeddingService.generateEmbedding(query)

      // Get relevant chunks
      const chunks = await db.chunk.findMany({
        where: {
          projectId,
          embedding: { not: null },
        },
        include: {
          document: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      const results = []
      for (const chunk of chunks) {
        if (!chunk.embedding) continue

        const chunkEmbedding = EmbeddingService.deserializeEmbedding(chunk.embedding)
        const similarity = EmbeddingService.cosineSimilarity(queryEmbedding, chunkEmbedding)

        if (similarity > 0.3) {
          results.push({
            chunkId: chunk.id,
            text: chunk.text,
            similarity,
            document: chunk.document,
            page: chunk.page,
          })
        }
      }

      // Sort by similarity
      results.sort((a, b) => b.similarity - a.similarity)

      return NextResponse.json({ results: results.slice(0, 10) })
    } catch (error) {
      console.error("Error in search:", error)
      return NextResponse.json({ error: "Failed to search" }, { status: 500 })
    }
  }
}
