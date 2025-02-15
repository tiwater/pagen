import { NextResponse } from 'next/server';

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'https://pages-renderer.tisvc.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${RENDERER_URL}/api/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to render page' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to renderer:', error);
    return NextResponse.json({ error: 'Failed to proxy request to renderer' }, { status: 500 });
  }
}
