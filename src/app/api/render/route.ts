import { mkdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import { GENERATED_DIR, writeGeneratedFile } from '@/lib/generated-files'

export async function POST(req: Request) {
  try {
    const { code, pageId } = await req.json()
    
    if (!code || !pageId) {
      return NextResponse.json(
        { error: 'Code and pageId are required' },
        { status: 400 }
      )
    }

    // Ensure generated directory exists
    await mkdir(GENERATED_DIR, { recursive: true })
    
    // Save to generated folder using pageId
    const previewUrl = await writeGeneratedFile(pageId, code)
    
    return NextResponse.json({ id: pageId, previewUrl })
  } catch (error) {
    console.error('Render error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process render request' },
      { status: 500 }
    )
  }
}
