import { uploadFile } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const { projectId, path } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_RENDERER_URL || 'https://pages-renderer.tisvc.com';
    const pageUrl = `${baseUrl}/p/${projectId}${path ? `/${path}` : ''}`;
    // const pageUrl = `https://www.google.com`; // for testing
    const response = await fetch('https://pages-webshot.tisvc.com/chrome/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pageUrl,
        options: {
          fullPage: true,
        },
        viewport: {
          width: 1920,
          height: 1080,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to capture screenshot ${response.status}`);
    }

    // Get the image blob with explicit MIME type
    const imageBlob = await response.blob();
    // Create a new Blob with explicit PNG MIME type
    const pngBlob = new Blob([imageBlob], { type: 'image/png' });
    
    // Handle undefined path and normalize by removing slashes
    const normalizedPath = path ? path.replace(/\//g, '-') : 'index';
    const filename = `page-${projectId}-${normalizedPath}-${Date.now()}.png`;

    console.log('Uploading screenshot:', filename);
    const uploadedFile = await uploadFile(new File([pngBlob], filename, { type: 'image/png' }), "screenshots");
    if (!uploadedFile) {
      throw new Error(`Failed to upload screenshot`);
    }

    return NextResponse.json({
      url: uploadedFile.url,
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}