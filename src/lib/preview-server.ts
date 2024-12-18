import { PreviewServerError } from '@/types/errors'

const PREVIEW_SERVER_URL = process.env.PREVIEW_SERVER_URL || 'http://localhost:3001'

export async function renderPreview(code: string): Promise<string> {
  try {
    // Generate unique ID for this preview
    const id = Math.random().toString(36).substring(7);

    // Store the code
    const storeResponse = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, code })
    });

    if (!storeResponse.ok) {
      const error = await storeResponse.json();
      throw new Error(error.error || 'Failed to store preview code');
    }

    // Get the rendered HTML
    const renderResponse = await fetch(`/api/preview?id=${id}`);
    if (!renderResponse.ok) {
      const error = await renderResponse.json();
      throw new Error(error.error || 'Failed to render preview');
    }

    return await renderResponse.text();
  } catch (error) {
    console.error('Preview error:', error);
    throw error;
  }
}

export async function startPreviewServer() {
  try {
    const response = await fetch(`${PREVIEW_SERVER_URL}/health`);
    if (!response.ok) {
      throw new Error('Preview server is not responding');
    }
    console.log('Preview server is running');
  } catch (error) {
    console.error('Failed to connect to preview server:', error);
    throw error;
  }
}
