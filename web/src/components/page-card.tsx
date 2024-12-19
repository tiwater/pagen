'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { usePageStore } from '@/store/page';
import { codeToHtml } from 'shiki/bundle/web';
import { cn } from '@/lib/utils';
import { Icons } from './ui/icons';
import '@/styles/code-block.css';

interface PageCardProps {
  messageId: string;
}

export function PageCard({ messageId }: PageCardProps) {
  const { pages, setActivePage } = usePageStore();
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState('');
  const page = pages[messageId];

  useEffect(() => {
    if (!page) return;

    const highlight = async () => {
      const highlighted = await codeToHtml(page.content.split('\n').slice(0, 3).join('\n'), {
        lang: 'tsx',
        theme: resolvedTheme === 'dark' ? 'nord' : 'github-light',
      });
      setHtml(
        highlighted
          .replace(
            '<pre class="shiki"',
            '<pre class="shiki !bg-transparent w-full" style="overflow-x: auto; white-space: pre-wrap; word-break: break-word;"'
          )
          .replace(
            '<code>',
            '<code style="white-space: pre-wrap; display: block; overflow-wrap: break-word;">'
          )
      );
    };

    highlight();
  }, [page?.content, resolvedTheme]);

  if (!page) return null;

  const handleClick = () => {
    if (page.status === 'complete') {
      setActivePage(messageId);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-muted-foreground overflow-hidden bg-background/50 transition-colors min-w-0 max-w-full',
        page.status === 'complete' && 'hover:bg-accent/5 cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between border-b border-muted bg-background/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icons.window className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Generated Page</span>
        </div>
        <div className="flex items-center gap-2">
          {page.status === 'generating' && (
            <Icons.spinner className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {page.status === 'complete' && (
            <>
              <Icons.checkCircle className="h-3.5 w-3.5 text-green-500" />
            </>
          )}
        </div>
      </div>
      <div
        className="w-full text-xs bg-muted/50 p-2 max-h-[120px] overflow-x-auto overflow-y-hidden break-words"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
