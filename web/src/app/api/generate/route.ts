import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Generate Webpage
 *     description: Generate a webpage from a text prompt
 *     tags:
 *       - Generation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The text prompt describing the webpage you want to generate
 *                 example: "a beautiful login page with gradient background"
 *     responses:
 *       200:
 *         description: Successfully generated webpage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique identifier for the generated page
 *                   example: "abc123"
 *                 url:
 *                   type: string
 *                   description: The URL where the generated page can be viewed
 *                   example: "https://pages.dustland.ai/p/abc123"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required field: prompt"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate page"
 */
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
    const pageId = lastMessage.id;

    // Step 2: Poll until the page is ready
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const pageResponse = await fetch(`${process.env.NEXT_PUBLIC_RENDERER_URL || 'https://render.dustland.ai'}/api/pages/${pageId}`);
      if (pageResponse.ok) {
        const { status } = await pageResponse.json();
        if (status === 'ready') {
          break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Timeout waiting for page to be ready');
    }

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