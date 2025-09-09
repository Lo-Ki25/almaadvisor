import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const createProjectSchema = z.object({
  title: z.string().min(1),
  client: z.string().optional(),
  lead: z.string().optional(),
  language: z.enum(["FR", "EN", "BILINGUAL"]).default("FR"),
  committee: z.enum(["institutionnel", "technique", "mixte"]).optional(),
  style: z.enum(["cabinet", "pedagogique", "mixte"]).optional(),
  methodologies: z.array(z.string()).optional(),
  ragOptions: z
    .object({
      chunkSize: z.number().default(800),
      overlap: z.number().default(120),
      topK: z.number().default(8),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/projects - Starting request')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const data = createProjectSchema.parse(body)
    console.log('Validated data:', JSON.stringify(data, null, 2))

    console.log('Creating project in database...')
    const project = await db.project.create({
      data: {
        title: data.title,
        client: data.client,
        lead: data.lead,
        language: data.language,
        committee: data.committee,
        style: data.style,
        methodologies: data.methodologies ? JSON.stringify(data.methodologies) : null,
        ragOptions: data.ragOptions ? JSON.stringify(data.ragOptions) : null,
        status: "draft",
      },
    })
    console.log('Project created successfully:', project.id)

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error creating project:", error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: "Failed to create project", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        documents: true,
        report: true,
        _count: {
          select: {
            documents: true,
            chunks: true,
            diagrams: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
