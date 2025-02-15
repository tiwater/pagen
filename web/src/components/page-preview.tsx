'use client';

import { useEffect, useState } from 'react';
import { usePageStore } from '@/store/page';
import { Loading } from './loading';

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'https://pages-renderer.tisvc.com';

interface PagePreviewProps {
  messageId?: string;
}

export function PagePreview({ messageId }: PagePreviewProps) {
  const { pages } = usePageStore();
  const page = messageId ? pages[messageId] : null;
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function createPreviewPage() {
      if (!page?.content) return;

      try {
        console.log('Sending preview request to:', '/api/render');
        console.log('Preview content:', page.content);

        const response = await fetch('/api/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: messageId, code: page.content }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Preview response not OK:', response.status, errorText);
          throw new Error('Failed to create preview page');
        }

        const data = await response.json();
        console.log('Preview response:', data);
        console.log('RENDERER_URL:', RENDERER_URL);
        console.log('Final Preview URL:', `${RENDERER_URL}${data.url}`);
        setPreviewUrl(`${RENDERER_URL}${data.url}`);
      } catch (error) {
        console.error('Failed to create preview:', error);
      } finally {
        setIsLoading(false);
      }
    }

    createPreviewPage();
  }, [messageId, page?.status]);

  if (isLoading) {
    return <Loading />;
  }

  if (!previewUrl) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load preview
      </div>
    );
  }

  return (
    <iframe
      src={previewUrl}
      className="h-full w-full"
      allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
    />
  );
}
