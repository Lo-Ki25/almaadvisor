import { type NextRequest, NextResponse } from "next/server"

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[UPLOAD] Starting file upload for project: ${params.id}`)
  
  try {
    const projectId = params.id
    
    // Redirect to our new API
    const uploadUrl = new URL('/api/upload', request.url)
    uploadUrl.searchParams.set('project', projectId)
    uploadUrl.searchParams.set('title', `Project ${projectId}`)
    uploadUrl.searchParams.set('client', 'Client')
    
    // Forward the form data to our new upload endpoint
    const formData = await request.formData()
    
    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error in upload:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload files" },
      { status: 500 },
    )
  }
}
