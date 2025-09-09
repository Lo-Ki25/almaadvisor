import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ReportGenerator } from "@/lib/report-generator"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Verify project exists and has embedded chunks
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        chunks: {
          where: { embedding: { not: null } },
          take: 1,
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.chunks.length === 0) {
      return NextResponse.json(
        { error: "No embedded chunks found. Please run embedding generation first." },
        { status: 400 },
      )
    }

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "generating",
        updatedAt: new Date(),
      },
    })

    // Generate the report
    const generator = new ReportGenerator()
    const reportMarkdown = await generator.generateReport(projectId)

    return NextResponse.json({
      message: "Report generated successfully",
      reportLength: reportMarkdown.length,
      projectId,
    })
  } catch (error) {
    console.error("Error generating report:", error)

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
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 },
    )
  }
}
