'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';


interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? nord : oneLight;

  return (
    <div className="overflow-x-auto text-xs">
      <SyntaxHighlighter
        language={language}
        style={theme}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}