import { type NextRequest, NextResponse } from "next/server"

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[EMBED] Starting embedding generation for project: ${params.id}`)
  
  try {
    const projectId = params.id
    
    // Redirect to our new API
    const embedUrl = new URL('/api/embed', request.url)
    embedUrl.searchParams.set('project', projectId)
    
    // Make internal API call to our new embed endpoint
    const response = await fetch(embedUrl.toString(), {
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
    console.error("Error in embed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate embeddings" },
      { status: 500 },
    )
  }
}
