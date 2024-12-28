import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_RENDERER_URL || 'https://render.dustland.ai';
    const pageUrl = `${baseUrl}/p/${id}`;

    const response = await fetch('https://webshot.dustland.ai/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pageUrl,
        options: {
          fullPage: true,
        },
        waitForSelector: {
          selector: '.preview-container',
          timeout: 10000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to capture screenshot ${response.status}`);
    }

    // Get the image blob
    const imageBlob = await response.blob();

    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=screenshot-${id}.png`,
      },
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}