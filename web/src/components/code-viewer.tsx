'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ProjectFile } from '@/types/project';
import { ScrollArea } from './ui/scroll-area';

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

  const language = file.name.endsWith('.tsx')
    ? 'typescript'
    : file.name.endsWith('.jsx')
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
