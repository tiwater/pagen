'use client';

import { useCallback, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';
import { usePageStore } from '@/store/page';
import { CodeBlock } from '@/components/code-block';
import { PagePreview } from '@/components/page-preview';
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
import { Button } from './ui/button';
import { Icons } from './ui/icons';

interface CodeWorkspaceProps {
  id: string;
  isMobile: boolean;
  setIsPreviewOpen?: (open: boolean) => void;
}

export function CodeWorkspace({ id, isMobile }: CodeWorkspaceProps) {
  const { pages, activePage } = usePageStore();
  const activePageData = activePage ? pages[activePage] : null;
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description:
        'The command has been copied to your clipboard. You can now paste it into your terminal.',
      variant: 'default',
    });
  };

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
    <div className="flex h-full flex-col">
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate API</DialogTitle>
                    <DialogDescription>
                      Use this API to generate a page from a prompt and get its screenshot. Send a
                      POST request with the following curl command:
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                        {`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${activePageData?.prompt?.replace(/'/g, "\\'") || 'a beautiful login page'}"}' \\
  --output page.png`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() =>
                          handleCopy(`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.dustland.ai'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${activePageData?.prompt?.replace(/'/g, "\\'") || 'a beautiful login page'}"}' \\
  --output page.png`)
                        }
                      >
                        <Icons.copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {!activePageData?.prompt && (
                      <p className="text-sm text-yellow-500">
                        Note: Using default prompt as no prompt was found for this page.
                      </p>
                    )}
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