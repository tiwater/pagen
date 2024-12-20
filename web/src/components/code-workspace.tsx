'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { usePageStore } from '@/store/page';
import { CodeBlock } from '@/components/code-block';
import { CopyButton } from '@/components/copy-button';
import { Icons } from '@/components/icons';
import { PagePreview } from '@/components/page-preview';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface CodeWorkspaceProps {
  id: string;
  isMobile: boolean;
  setIsPreviewOpen?: (open: boolean) => void;
}

export function CodeWorkspace({ id, isMobile }: CodeWorkspaceProps) {
  const { pages, activePage } = usePageStore();
  const activePageData = activePage ? pages[activePage] : null;
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const handleScreenshot = useCallback(async () => {
    if (!activePage) return;

    try {
      setIsScreenshotting(true);
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activePage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture screenshot');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot-${activePage}.png`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Screenshot error:', error);
    } finally {
      setIsScreenshotting(false);
    }
  }, [activePage]);

  return (
    <div className="flex h-full flex-col max-w-full">
      <Tabs defaultValue="code" className="flex-1 h-full flex flex-col">
        <div className="flex items-center justify-between border-b">
          <TabsList className="bg-transparent">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Icons.terminal className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Icons.window className="h-4 w-4" />
              Preview
            </TabsTrigger>
            {activePageData && (
              <div className="flex items-center gap-2 p-2">
                {activePageData.status === 'generating' && (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                )}
              </div>
            )}
          </TabsList>
          {activePageData && (
            <div className="flex items-center gap-2 p-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={!activePageData || activePageData.status !== 'complete'}
                    className="h-8 w-8 p-0"
                  >
                    <Icons.api className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icons.api className="h-4 w-4" />
                      <span>Generate API</span>
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                      <p>
                        Use this API to generate a page from a prompt and get its screenshot. Send a
                        POST request with the following curl command:
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="rounded-lg overflow-hidden bg-muted">
                        <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                          <code className="text-sm">
                            {`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${activePageData?.prompt?.replace(/'/g, "\\'") || 'a beautiful login page'}"}' \\
  --output page.png`}
                          </code>
                        </pre>
                        <CopyButton
                          className="absolute top-2 right-2 h-6 w-6"
                          text={`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${activePageData?.prompt?.replace(/'/g, "\\'") || 'a beautiful login page'}"}' \\
  --output page.png`}
                        />
                      </div>
                    </div>
                    {!activePageData?.prompt && (
                      <p className="text-sm text-yellow-500">
                        Note: Using default prompt as no prompt was found for this page.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      For more information on how to use this API, visit our{' '}
                      <Link
                        href="/docs"
                        target="_blank"
                        className="underline hover:text-primary"
                      >
                        API documentation
                      </Link>
                      .
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                onClick={handleScreenshot}
                disabled={
                  !activePageData || activePageData.status !== 'complete' || isScreenshotting
                }
                className="h-8 w-8 p-0"
              >
                {isScreenshotting ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <Icons.camera className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 h-[calc(100%-4rem)] overflow-hidden">
          <TabsContent value="code" className="h-full m-0 bg-muted/20">
            {activePageData ? (
              <ScrollArea className="h-full w-full">
                <CodeBlock code={activePageData.content || ''} language="tsx" />
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No page selected
              </div>
            )}
          </TabsContent>
          <TabsContent value="preview" className="h-full m-0">
            {activePageData && <PagePreview messageId={activePageData.messageId} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}