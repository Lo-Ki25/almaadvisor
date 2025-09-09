import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
        },
        chunks: {
          take: 10,
          include: {
            document: {
              select: { name: true },
            },
          },
        },
        citations: {
          include: {
            document: {
              select: { name: true },
            },
          },
        },
        diagrams: {
          orderBy: { createdAt: "desc" },
        },
        tables: {
          orderBy: { createdAt: "desc" },
        },
        report: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
