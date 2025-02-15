'use client';

import { ProjectFile } from '@/types/chat';
import { ScrollArea } from './ui/scroll-area';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  file?: ProjectFile;
}

export function CodeViewer({ file }: CodeViewerProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No file selected
      </div>
    );
  }

  const language = file.path.endsWith('.tsx')
    ? 'typescript'
    : file.path.endsWith('.jsx')
    ? 'javascript'
    : 'text';

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            background: 'transparent',
          }}
        >
          {file.content || '// Empty file'}
        </SyntaxHighlighter>
      </div>
    </ScrollArea>
  );
} 