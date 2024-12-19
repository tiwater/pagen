'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? nord : oneLight;

  return (
    <div className="overflow-x-auto overflow-y-hidden text-xs">
      <ReactMarkdown
        components={{
          code: ({ className, children }) => (
            <SyntaxHighlighter
              language={language}
              style={theme}
              customStyle={{
                margin: 0,
                padding: '1rem',
              }}
              className={cn('min-w-max', className)}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ),
        }}
        className="overflow-auto"
      >
        {`\`\`\`${language}\n${code}\n\`\`\``}
      </ReactMarkdown>
    </div>
  );
}