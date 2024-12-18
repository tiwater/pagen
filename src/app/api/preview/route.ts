import { NextResponse } from 'next/server'
import { PreviewService } from '@/lib/preview-service'

// Singleton instance of PreviewService
let previewService: PreviewService | null = null;

async function ensurePreviewService() {
  if (!previewService) {
    previewService = new PreviewService();
    await previewService.start();
  }
  return previewService;
}

export async function POST(request: Request) {
  try {
    const { code, id } = await request.json()
    console.log('Creating preview for id:', id)
    
    const service = await ensurePreviewService();
    const previewUrl = await service.createPreview(id, code);
    
    return NextResponse.json({ success: true, url: previewUrl })
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const service = await ensurePreviewService();
    const url = new URL(request.url);
    const response = await service.proxyRequest(url.pathname + url.search);
    
    // Forward the response from Next.js dev server
    const headers = new Headers(response.headers);
    headers.set('x-frame-options', 'ALLOWALL'); // Allow embedding in iframes
    
    return new Response(response.body, {
      status: response.status,
      headers
    });
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
