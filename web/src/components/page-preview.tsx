'use client';

import path from 'path';
import { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import { PageTreeNode, Project, ProjectFile } from '@/types/project';
import { Loading } from './loading';

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'https://pages-renderer.tisvc.com';

interface PagePreviewProps {
  project: Project;
  file: PageTreeNode;
}

export function PagePreview({ file, project }: PagePreviewProps) {
  console.log('PagePreview', file, project);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function createPreviewPage() {
      if (!project?.pageTree) return;

      try {
        console.log('Sending preview request to:', '/api/render');
        console.log('Preview pageTree:', project.pageTree);

        const response = await fetch('/api/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: project.id,
            pageTree: project.pageTree,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Preview response not OK:', response.status, errorText);
          throw new Error('Failed to create preview page');
        }

        const data = await response.json();
        console.log('Preview response:', data);
        console.log('RENDERER_URL:', RENDERER_URL);

        // Convert file path to URL path
        // e.g., 'app/about/page.tsx' -> '/about'
        // e.g., 'app/page.tsx' -> '/'
        const urlPath = file.path
          .replace(/^app\//, '') // Remove 'app/' prefix
          .replace(/\/page\.tsx$/, '') // Remove '/page.tsx' suffix
          .replace(/^page\.tsx$/, ''); // Handle root page

        console.log('URL Path:', file, urlPath);

        const finalUrl = `${RENDERER_URL}${data.url}${urlPath === '' ? '' : `/${urlPath}`}`;
        console.log('Final Preview URL:', finalUrl);
        setPreviewUrl(finalUrl);
      } catch (error) {
        console.error('Failed to create preview:', error);
      } finally {
        setIsLoading(false);
      }
    }

    createPreviewPage();
  }, [project?.id, file]);

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
