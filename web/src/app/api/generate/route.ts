import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Step 1: Generate the page using the chat API
    const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/chat`, {
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
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate page');
    }

    const { messages } = await chatResponse.json();
    const lastMessage = messages[messages.length - 1];
    const pageId = lastMessage.id;

    // Step 2: Wait for a moment to let the page render
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Get the screenshot
    const screenshotResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: pageId,
      }),
    });

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