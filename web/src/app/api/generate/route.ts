import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    // Step 1: Generate the page using the chat API
    const chatResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
        }),
      }
    );

    if (!chatResponse.ok) {
      throw new Error('Failed to generate page');
    }

    const { messages } = await chatResponse.json();
    const lastMessage = messages[messages.length - 1];

    // Step 2: Submit the page to the renderer
    const pageId = nanoid(10);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://render.dustland.ai'}/api/render`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pageId,
          code: lastMessage.content,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit page to renderer');
    }

    // Step 2: Poll until the page is ready
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const pageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_RENDERER_URL || 'https://render.dustland.ai'}/api/pages?id=${pageId}`
      );
      if (pageResponse.ok) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Timeout waiting for page to be ready');
    }

    // Step 3: Get the screenshot
    const screenshotResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/screenshot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pageId,
        }),
      }
    );

    if (!screenshotResponse.ok) {
      throw new Error('Failed to capture screenshot');
    }

    // Return the screenshot image
    const imageBlob = await screenshotResponse.blob();
    return new Response(imageBlob, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}