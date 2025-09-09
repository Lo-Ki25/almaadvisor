import { type NextRequest, NextResponse } from "next/server"

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[INGEST] Starting ingestion for project: ${params.id}`)
  
  try {
    const projectId = params.id
    
    // Redirect to our new API
    const ingestUrl = new URL('/api/ingest', request.url)
    ingestUrl.searchParams.set('project', projectId)
    
    // Make internal API call to our new ingest endpoint
    const response = await fetch(ingestUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error in ingest:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to ingest documents" },
      { status: 500 },
    )
  }
}
