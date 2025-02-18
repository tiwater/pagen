'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { CodeViewer } from './code-viewer';
import { Icons } from './icons';
import { Button } from './ui/button';

interface PageCardProps {
  children: React.ReactNode;
}

export function PageCard({ children }: PageCardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent theme flash during hydration
  if (!mounted) {
    return null; // or a loading skeleton
  }

  const content = children?.toString();
  const lines = content?.split('\n').length;
  return (
    <>
      <div
        className={cn(
          'group relative rounded-lg border border-muted-foreground/40 overflow-hidden bg-background/50 transition-colors min-w-0 max-w-full'
          // page.status === 'complete' && 'hover:bg-accent/5',
          // messageId === activePage && 'border-muted-foreground/80'
        )}
      >
        <div className="flex items-center justify-between border-b border-muted bg-background/50 p-2 h-7">
          <div className="flex items-center gap-2">
            <Icons.window className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{`Generated Page (${lines} lines)`}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setIsDialogOpen(true)}
          >
            <Icons.code className="h-4 w-4" />
          </Button>
        </div>
        {!content && (
          <div className="w-full text-xs bg-muted/50 p-2 max-h-[140px] overflow-x-auto overflow-y-hidden whitespace-pre-wrap break-words">
            <p>No content</p>
          </div>
        )}
        {content && (
          <pre className="w-full text-xs bg-muted/50 p-2 max-h-[140px] overflow-x-auto overflow-y-hidden whitespace-pre-wrap break-words">
            {content.split('\n').slice(0, 3).join('\n')}
            {content.split('\n').length > 3 && '\n...'}
          </pre>
        )}
      </div>

      <CodeViewer open={isDialogOpen} onOpenChange={setIsDialogOpen} code={content || ''} />
    </>
  );
}
