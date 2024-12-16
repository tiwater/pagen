import { NextResponse } from 'next/server'
import { writeFile, access, mkdir } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001'
        : 'https://pagen.dustland.ai',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
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

    // Ensure the app directory exists
    const appDir = join(process.cwd(), 'app')
    try {
      await access(appDir, constants.W_OK)
    } catch (error) {
      console.log('Creating app directory...')
      await mkdir(appDir, { recursive: true })
    }

    // Write content to page.tsx
    const pagePath = join(process.cwd(), 'app', 'page.tsx')
    console.log('Writing to:', pagePath)
    
    try {
      await writeFile(pagePath, content, { 
        encoding: 'utf-8',
        mode: 0o666 // Set file permissions to read/write
      })
    } catch (writeError) {
      console.error('Write error:', writeError)
      return NextResponse.json(
        { error: 'Failed to write file', details: writeError instanceof Error ? writeError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    const responseHeaders = {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001'
        : 'https://pagen.dustland.ai',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }

    return NextResponse.json({ 
      success: true,
      message: 'Page updated successfully',
      path: pagePath
    }, {
      headers: responseHeaders
    })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
