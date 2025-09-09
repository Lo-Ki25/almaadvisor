import { db } from "@/lib/db"
import { EmbeddingService } from "@/lib/embeddings"

export interface RetrievalResult {
  chunkId: string
  text: string
  similarity: number
  document: {
    id: string
    name: string
    page: number
  }
}

export class RAGRetriever {
  private embeddingService: EmbeddingService

  constructor() {
    this.embeddingService = EmbeddingService.getInstance()
  }

  async retrieveRelevantChunks(
    projectId: string,
    query: string,
    topK = 8,
    minSimilarity = 0.3,
  ): Promise<RetrievalResult[]> {
    // Generate embedding for the query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query)

    // Get all chunks for the project that have embeddings
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

    if (chunks.length === 0) {
      return []
    }

    // Calculate similarities
    const results: RetrievalResult[] = []

    for (const chunk of chunks) {
      if (!chunk.embedding) continue

      const chunkEmbedding = EmbeddingService.deserializeEmbedding(chunk.embedding)
      const similarity = EmbeddingService.cosineSimilarity(queryEmbedding, chunkEmbedding)

      if (similarity >= minSimilarity) {
        results.push({
          chunkId: chunk.id,
          text: chunk.text,
          similarity,
          document: {
            id: chunk.document.id,
            name: chunk.document.name,
            page: chunk.page,
          },
        })
      }
    }

    // Sort by similarity and return top K
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
  }

  async retrieveBySection(projectId: string, sectionKeywords: string[], topK = 5): Promise<RetrievalResult[]> {
    const allResults: RetrievalResult[] = []

    for (const keyword of sectionKeywords) {
      const results = await this.retrieveRelevantChunks(projectId, keyword, Math.ceil(topK / sectionKeywords.length))
      allResults.push(...results)
    }

    // Remove duplicates and sort by similarity
    const uniqueResults = allResults.filter(
      (result, index, self) => index === self.findIndex((r) => r.chunkId === result.chunkId),
    )

    return uniqueResults.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
  }

  formatRetrievalContext(results: RetrievalResult[]): string {
    if (results.length === 0) {
      return "Aucun contexte pertinent trouvé dans les documents."
    }

    return results
      .map((result, index) => {
        const citation = `[[${result.document.name}:${result.document.page}]]`
        return `[${index + 1}] ${result.text.trim()} ${citation}`
      })
      .join("\n\n")
  }

  extractCitations(results: RetrievalResult[]): Array<{
    docId: string
    docName: string
    page: number
    snippet: string
  }> {
    return results.map((result) => ({
      docId: result.document.id,
      docName: result.document.name,
      page: result.document.page,
      snippet: result.text.substring(0, 200) + (result.text.length > 200 ? "..." : ""),
    }))
  }
}
