'use client';

import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icons } from './icons';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

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
  return (
    <>
      <div
        className={cn(
          'group relative rounded-lg border border-muted-foreground/40 overflow-hidden bg-background/50 transition-colors min-w-0 max-w-full'
          // page.status === 'complete' && 'hover:bg-accent/5',
          // messageId === activePage && 'border-muted-foreground/80'
        )}
      >
        <div className="flex items-center justify-between border-b border-muted bg-background/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Icons.window className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{'Generated Page'}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsDialogOpen(true)}
          >
            <MoreHorizontal className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="text-sm font-medium p-2">Source Code</DialogTitle>
          <ScrollArea className="max-h-[calc(80vh-8rem)] w-full p-2">
            <SyntaxHighlighter
              language="tsx"
              style={resolvedTheme === 'dark' ? vscDarkPlus : vs}
              customStyle={{
                margin: 0,
                background: 'transparent',
                maxHeight: 'none',
                border: 'none',
              }}
            >
              {content || '// Empty file'}
            </SyntaxHighlighter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
