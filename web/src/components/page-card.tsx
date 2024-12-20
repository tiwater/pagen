'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { usePageStore } from '@/store/page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Icons } from './icons';


interface PageCardProps {
  messageId: string;
}

export function PageCard({ messageId }: PageCardProps) {
  const { pages, activePage, setActivePage } = usePageStore();
  const [showApiDialog, setShowApiDialog] = useState(false);
  const page = pages[messageId];

  if (!page) return null;

  const handleClick = () => {
    if (page.status === 'complete') {
      setActivePage(messageId);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://render.dustland.ai';

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-muted-foreground/40 overflow-hidden bg-background/50 transition-colors min-w-0 max-w-full',
        page.status === 'complete' && 'hover:bg-accent/5 cursor-pointer',
        messageId === activePage && 'border-muted-foreground/80'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between border-b border-muted bg-background/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icons.window className="h-4 w-4 text-muted-foreground" />
          {page.status === 'generating' && (
            <span className="text-sm font-medium">{'Generating...'}</span>
          )}
          {page.status === 'complete' && (
            <span className="text-sm font-medium">{page.metadata?.title || 'Generated Page'}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {page.status === 'generating' && (
            <Icons.spinner className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {page.status === 'complete' && (
            <Icons.checkCircle className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
      </div>
      <pre className="w-full text-xs bg-muted/50 p-2 max-h-[140px] overflow-x-auto overflow-y-hidden whitespace-pre-wrap break-words">
        {page.content.split('\n').slice(0, 3).join('\n')}
        {page.content.split('\n').length > 3 && '\n...'}
      </pre>
    </div>
  );
}