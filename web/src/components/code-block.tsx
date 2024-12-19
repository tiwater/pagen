'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { codeToHtml } from 'shiki/bundle/web';
import '@/styles/code-block.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState('');

  useEffect(() => {
    const highlight = async () => {
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: resolvedTheme === 'dark' ? 'nord' : 'github-light',
      });
      setHtml(highlighted);
    };

    highlight();
  }, [code, language, resolvedTheme]);

  return (
    <div
      className="flex w-full h-full overflow-auto text-xs p-2"
      dangerouslySetInnerHTML={{
        __html: html.replace('<pre class="shiki"', '<pre class="shiki p-4"'),
      }}
    />
  );
}
