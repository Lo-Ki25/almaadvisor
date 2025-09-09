// Document parsing utilities for Vercel deployment
// Note: In production, consider using external document parsing services

export interface ParsedDocument {
  text: string
  pages: number
  metadata?: Record<string, any>
}

export class DocumentParser {
  static async parseFile(filePath: string, mimeType: string): Promise<ParsedDocument> {
    // For Vercel deployment, we'll use placeholder implementations
    // In production, integrate with external document parsing services like:
    // - Adobe PDF Services API
    // - Microsoft Graph API
    // - Google Cloud Document AI

    switch (mimeType) {
      case "application/pdf":
        return this.parsePDFPlaceholder(filePath)
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.parseDOCXPlaceholder(filePath)
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-excel":
        return this.parseXLSXPlaceholder(filePath)
      case "text/csv":
        return this.parseCSVPlaceholder(filePath)
      case "text/markdown":
      case "text/plain":
        return this.parseTextPlaceholder(filePath)
      default:
        throw new Error(`Unsupported file type: ${mimeType}`)
    }
  }

  private static async parsePDFPlaceholder(filePath: string): Promise<ParsedDocument> {
    // Placeholder implementation - in production, use external PDF parsing service
    return {
      text: `PDF document content from ${filePath}. This is a placeholder implementation. In production, integrate with a PDF parsing service like Adobe PDF Services API or similar.`,
      pages: 1,
      metadata: { type: "pdf", source: filePath },
    }
  }

  private static async parseDOCXPlaceholder(filePath: string): Promise<ParsedDocument> {
    return {
      text: `DOCX document content from ${filePath}. This is a placeholder implementation.`,
      pages: 1,
      metadata: { type: "docx", source: filePath },
    }
  }

  private static async parseXLSXPlaceholder(filePath: string): Promise<ParsedDocument> {
    return {
      text: `XLSX document content from ${filePath}. This is a placeholder implementation.`,
      pages: 1,
      metadata: { type: "xlsx", source: filePath },
    }
  }

  private static async parseCSVPlaceholder(filePath: string): Promise<ParsedDocument> {
    return {
      text: `CSV document content from ${filePath}. This is a placeholder implementation.`,
      pages: 1,
      metadata: { type: "csv", source: filePath },
    }
  }

  private static async parseTextPlaceholder(filePath: string): Promise<ParsedDocument> {
    return {
      text: `Text document content from ${filePath}. This is a placeholder implementation.`,
      pages: 1,
      metadata: { type: "text", source: filePath },
    }
  }

  // Original parse methods are kept for reference and potential future use
  private static async parsePDF(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const data = await pdf(buffer)
      return {
        text: data.text,
        pages: data.numpages,
        metadata: data.metadata,
      }
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`)
    }
  }

  private static async parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return {
        text: result.value,
        pages: Math.ceil(result.value.length / 3000), // Estimate pages
        metadata: { warnings: result.messages },
      }
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error}`)
    }
  }

  private static async parseXLSX(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" })
      let text = ""
      let totalRows = 0

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        text += `\n=== ${sheetName} ===\n${csv}\n`
        totalRows += csv.split("\n").length
      })

      return {
        text: text.trim(),
        pages: Math.ceil(totalRows / 50), // Estimate pages
        metadata: { sheets: workbook.SheetNames },
      }
    } catch (error) {
      throw new Error(`Failed to parse XLSX: ${error}`)
    }
  }

  private static async parseCSV(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const text = buffer.toString("utf-8")
      const records = csvParse(text, { columns: true })

      // Convert to readable format
      const formattedText = records
        .map((record) =>
          Object.entries(record)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | "),
        )
        .join("\n")

      return {
        text: formattedText,
        pages: Math.ceil(records.length / 50),
        metadata: { rows: records.length, columns: Object.keys(records[0] || {}) },
      }
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error}`)
    }
  }

  private static async parseText(buffer: Buffer): Promise<ParsedDocument> {
    const text = buffer.toString("utf-8")
    return {
      text,
      pages: Math.ceil(text.length / 3000),
      metadata: { encoding: "utf-8" },
    }
  }
}

export class TextChunker {
  static chunkText(text: string, chunkSize = 800, overlap = 120): Array<{ text: string; start: number; end: number }> {
    const chunks: Array<{ text: string; start: number; end: number }> = []

    if (text.length <= chunkSize) {
      return [{ text, start: 0, end: text.length }]
    }

    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunkText = text.slice(start, end)

      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastSentence = chunkText.lastIndexOf(".")
        const lastNewline = chunkText.lastIndexOf("\n")
        const breakPoint = Math.max(lastSentence, lastNewline)

        if (breakPoint > start + chunkSize * 0.5) {
          chunkText = text.slice(start, start + breakPoint + 1)
        }
      }

      chunks.push({
        text: chunkText.trim(),
        start,
        end: start + chunkText.length,
      })

      start += chunkText.length - overlap
      if (start >= text.length) break
    }

    return chunks
  }

  static extractPageFromChunk(text: string, chunkStart: number, totalText: string): number {
    // Estimate page number based on position in document
    const textBeforeChunk = totalText.slice(0, chunkStart)
    const estimatedPage = Math.floor(textBeforeChunk.length / 3000) + 1
    return Math.max(1, estimatedPage)
  }
}
