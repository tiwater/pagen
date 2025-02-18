'use client';

import { memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  title?: string;
  language?: string;
}

export const CodeViewer = memo(function CodeViewer({
  open,
  onOpenChange,
  code,
  title = 'Code',
  language = 'typescript',
}: CodeViewerProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-4xl h-[80vh] bg-background p-0 shadow-xl">
        <DialogTitle className="flex items-center gap-2 p-2 h-12">
          <Icons.code className="h-5 w-5" />
          <span className="text-sm font-medium">{title}</span>
        </DialogTitle>
        <ScrollArea className="flex-1">
          <SyntaxHighlighter
            language={language}
            style={resolvedTheme === 'dark' ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              background: 'transparent',
              border: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
