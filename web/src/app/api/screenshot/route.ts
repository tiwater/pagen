import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/screenshot:
 *   post:
 *     summary: Take Screenshot
 *     description: Take a screenshot of a generated webpage
 *     tags:
 *       - Screenshot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: The page ID of the generated webpage
 *                 example: "abc123"
 *     responses:
 *       200:
 *         description: Successfully captured screenshot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the captured screenshot
 *                   example: "https://pages.dustland.ai/screenshots/abc123.png"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required field: id"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to capture screenshot"
 */
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