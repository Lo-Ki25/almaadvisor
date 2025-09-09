import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DocumentParser, TextChunker } from "@/lib/document-parser"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Get project and its documents
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { documents: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const ragOptions = project.ragOptions
      ? JSON.parse(project.ragOptions)
      : {
          chunkSize: 800,
          overlap: 120,
          topK: 8,
        }

    let totalChunks = 0

    // Process each document
    for (const document of project.documents) {
      if (document.status !== "uploaded") continue

      try {
        // Update document status
        await db.document.update({
          where: { id: document.id },
          data: { status: "processing" },
        })

        // Parse document
        const parsed = await DocumentParser.parseFile(document.path, document.mime)

        // Update document with page count
        await db.document.update({
          where: { id: document.id },
          data: { pages: parsed.pages },
        })

        // Chunk the text
        const chunks = TextChunker.chunkText(parsed.text, ragOptions.chunkSize, ragOptions.overlap)

        // Save chunks to database
        for (const chunk of chunks) {
          const page = TextChunker.extractPageFromChunk(chunk.text, chunk.start, parsed.text)

          await db.chunk.create({
            data: {
              projectId,
              docId: document.id,
              page,
              text: chunk.text,
              metadata: JSON.stringify({
                start: chunk.start,
                end: chunk.end,
                chunkSize: ragOptions.chunkSize,
                overlap: ragOptions.overlap,
              }),
            },
          })
          totalChunks++
        }

        // Mark document as processed
        await db.document.update({
          where: { id: document.id },
          data: { status: "processed" },
        })
      } catch (error) {
        console.error(`Error processing document ${document.name}:`, error)

        // Mark document as error
        await db.document.update({
          where: { id: document.id },
          data: { status: "error" },
        })
      }
    }

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "ingested",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Documents ingested successfully",
      totalChunks,
      processedDocuments: project.documents.length,
    })
  } catch (error) {
    console.error("Error ingesting documents:", error)
    return NextResponse.json({ error: "Failed to ingest documents" }, { status: 500 })
  }
}
