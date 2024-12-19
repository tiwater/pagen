"use client";

import { usePageStore } from "@/store/page";
import { Icons } from "./ui/icons";
import { cn } from "@/lib/utils";
import { codeToHtml } from 'shiki/bundle/web';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
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
        theme: resolvedTheme === 'dark' ? 'nord' : 'github-light'
      });
      setHtml(highlighted.replace(
        '<pre class="shiki"',
        '<pre class="shiki !bg-transparent w-full" style="overflow: hidden; text-overflow: ellipsis;"'
      ).replace(
        '<code>',
        '<code style="white-space: pre; display: block; overflow: hidden; text-overflow: ellipsis;">'
      ));
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
        "group relative rounded-lg border border-muted-foreground overflow-hidden bg-background/50 transition-colors min-w-0",
        page.status === 'complete' && "hover:bg-accent/5 cursor-pointer"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between border-b border-muted bg-background/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icons.window className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Generated Page</span>
        </div>
        <div className="flex items-center gap-2">
          {page.status === "generating" && (
            <Icons.spinner className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {page.status === "complete" && (
            <>
              <Icons.check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-muted-foreground">Ready</span>
            </>
          )}
        </div>
      </div>
      <div 
        className="w-full text-xs bg-muted/50 p-2 max-h-[120px] overflow-hidden"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
