'use server';

import { NextRequest } from 'next/server';

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'http://localhost:3345';

export async function POST(request: NextRequest) {
  try {
    const { projectId, pageTree } = await request.json();

    // First, send the pageTree to the renderer
    const rendererResponse = await fetch(`/api/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, pageTree }),
    });

    if (!rendererResponse.ok) {
      throw new Error('Failed to render site');
    }

    const { url: baseUrl } = await rendererResponse.json();

    // Process each page in the pageTree directly
    for (const node of pageTree) {
      if (!node.file) continue; // Skip nodes without files

      // Convert file path to URL path
      // e.g., 'app/about/page.tsx' -> '/about'
      const urlPath = node.path
        .replace(/^app\//, '')
        .replace(/\/page\.tsx$/, '')
        .replace(/^page\.tsx$/, '');

      const pageUrl = `${RENDERER_URL}${baseUrl}${urlPath === '' ? '' : `/${urlPath}`}`;

      try {
        // Take screenshot using the existing screenshot endpoint
        const screenshotResponse = await fetch('/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: pageUrl }),
        });

        if (!screenshotResponse.ok) {
          console.error(`Failed to take screenshot for ${pageUrl}`);
          continue;
        }

        const { screenshotUrl } = await screenshotResponse.json();
        node.screenshot = screenshotUrl;
      } catch (error) {
        console.error(`Error taking screenshot for ${pageUrl}:`, error);
        // Continue with other pages even if one fails
        continue;
      }
    }

    return Response.json({ pageTree });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate site' }),
      { status: 500 }
    );
  }
}