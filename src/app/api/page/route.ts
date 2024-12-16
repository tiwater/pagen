import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Get runtime URL from environment variable
const NEXT_RUNTIME_URL = process.env.NEXT_RUNTIME_URL || 'http://localhost:3000'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Send content to the Docker runtime
    const response = await fetch(`${NEXT_RUNTIME_URL}/api/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update page content')
    }

    const responseHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    return NextResponse.json({ 
      success: true,
      runtimeUrl: NEXT_RUNTIME_URL 
    }, { 
      headers: responseHeaders 
    })
  } catch (error) {
    console.error('Page update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update page' },
      { status: 500 }
    )
  }
}
