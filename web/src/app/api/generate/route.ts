'use server';

import { NextRequest } from 'next/server';

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'http://localhost:3345';

interface PageInfo {
  path: string;
  title: string;
  screenshotUrl: string;
  previewUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const { id, pageTree } = await request.json();

    // First, send the pageTree to the renderer
    const rendererResponse = await fetch(`${RENDERER_URL}/api/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, pageTree }),
    });

    if (!rendererResponse.ok) {
      throw new Error('Failed to render site');
    }

    const { url: baseUrl } = await rendererResponse.json();
    const pages: PageInfo[] = [];

    // Process each page in the pageTree
    for (const node of pageTree) {
      // Convert file path to URL path
      // e.g., 'app/about/page.tsx' -> '/about'
      const urlPath = node.path
        .replace(/^app\//, '')
        .replace(/\/page\.tsx$/, '')
        .replace(/^page\.tsx$/, '');

      const pageUrl = `${RENDERER_URL}${baseUrl}${urlPath === '' ? '' : `/${urlPath}`}`;

      // Take screenshot using the existing screenshot endpoint
      const screenshotResponse = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pageUrl }),
      });

      if (!screenshotResponse.ok) {
        throw new Error('Failed to take screenshot');
      }

      const { screenshotUrl } = await screenshotResponse.json();

      // Extract page title from metadata or use path
      const title = node.file.metadata?.title || node.path.split('/').pop()?.replace('.tsx', '') || 'Untitled';

      pages.push({
        path: urlPath || '/',
        title,
        screenshotUrl,
        previewUrl: pageUrl,
      });
    }

    return Response.json({ pages });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate site' }),
      { status: 500 }
    );
  }
}