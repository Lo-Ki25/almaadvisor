import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { FileUploadHandler } from "@/lib/file-upload"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Handle file upload
    const uploadedFiles = await FileUploadHandler.handleUpload(request, projectId)

    // Save file metadata to database
    const documents = await Promise.all(
      uploadedFiles.map((file) =>
        db.document.create({
          data: {
            projectId,
            name: file.name,
            mime: file.type,
            path: file.path,
            size: file.size,
            status: "uploaded",
          },
        }),
      ),
    )

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "uploading",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Files uploaded successfully",
      documents,
    })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload files" },
      { status: 500 },
    )
  }
}
