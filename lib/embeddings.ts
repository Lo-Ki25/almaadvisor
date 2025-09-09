// Embedding service for generating vector embeddings

// Configure transformers.js to use local models
// env.allowLocalModels = true
// env.allowRemoteModels = true

export class EmbeddingService {
  private static instance: EmbeddingService
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
  }

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService()
    }
    return EmbeddingService.instance
  }

  async initialize(): Promise<void> {
    // No initialization needed for API-based embeddings
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }
  }

  async generateEmbedding(text: string): Promise<Float32Array> {
    await this.initialize()

    // Clean and truncate text if too long
    const cleanText = text.replace(/\s+/g, " ").trim()
    const truncatedText = cleanText.length > 8000 ? cleanText.substring(0, 8000) : cleanText

    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: truncatedText,
          model: "text-embedding-3-small",
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return new Float32Array(data.data[0].embedding)
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw new Error("Failed to generate embedding")
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
    const embeddings: Float32Array[] = []

    // Process in smaller batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)

      for (const text of batch) {
        const embedding = await this.generateEmbedding(text)
        embeddings.push(embedding)

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return embeddings
  }

  static cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length")
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  static serializeEmbedding(embedding: Float32Array): Buffer {
    return Buffer.from(embedding.buffer)
  }

  static deserializeEmbedding(buffer: Buffer): Float32Array {
    return new Float32Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
  }
}
