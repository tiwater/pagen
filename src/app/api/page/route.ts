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

export async function GET(request: Request) {
  try {
    // Parse the request URL
    const url = new URL(request.url)
    // Get everything after /api/page to preserve static file paths
    const path = url.pathname.replace('/api/page', '')
    const targetUrl = `${NEXT_RUNTIME_URL}${path}${url.search}`

    console.log('Proxying request:', {
      originalUrl: url.toString(),
      path,
      targetUrl,
    })

    // Only forward essential headers
    const headers = new Headers({
      'Accept': request.headers.get('Accept') || '*/*',
      'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.5',
      'User-Agent': request.headers.get('user-agent') || '',
    })

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      console.error('Runtime returned error:', {
        status: response.status,
        statusText: response.statusText,
        targetUrl,
      })
      throw new Error(`Runtime returned ${response.status}`)
    }

    // Forward the response with essential headers
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    })
    
    // Copy content type and other important headers
    const contentType = response.headers.get('content-type')
    if (contentType) {
      responseHeaders.set('content-type', contentType)
    }

    // Get the response data
    let responseData = await response.text()
    
    // If this is an HTML response, rewrite relative paths to absolute proxy paths
    if (contentType?.includes('text/html')) {
      // Rewrite relative /_next/ paths to absolute /api/page/_next/ paths
      responseData = responseData.replace(
        /(href|src)="\/_next\//g,
        '$1="/api/page/_next/'
      )
    }
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Runtime proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy runtime' },
      { status: 500 }
    )
  }
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

    console.log('Page update:', content)

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

    const data = await response.json()

    const responseHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    return NextResponse.json({ 
      success: true,
      runtimeUrl: `${NEXT_RUNTIME_URL}?t=${Date.now()}`,
      ...data
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
