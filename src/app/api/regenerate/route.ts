import { NextResponse } from 'next/server'
import { ensureUIComponents } from '@/lib/generated-files'

export async function POST() {
  try {
    await ensureUIComponents()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to regenerate components:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
