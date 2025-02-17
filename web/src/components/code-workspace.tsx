'use client';

import { useCallback, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { PageTreeNode, Project } from '@/types/project';
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
import { cn } from '@/lib/utils';
import { AuthButton } from './auth-button';

interface CodeWorkspaceProps {
  id?: string;
  file?: PageTreeNode;
  project: Project;
}

export function CodeWorkspace({ id, file, project }: CodeWorkspaceProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? oneDark : oneLight;
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  const handleScreenshot = useCallback(async () => {
    if (!id) return;

    try {
      setIsScreenshotting(true);
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
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
      link.download = `screenshot-${id}.png`;
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
  }, [id]);

  return (
    <div className="flex h-full flex-col max-w-full">
      <Tabs defaultValue="code" className="flex-1 h-full flex flex-col">
        <div className="flex items-center justify-between border-b h-10">
          <TabsList className="bg-transparent gap-2">
            {[
              {
                value: 'code',
                icon: Icons.code,
                label: 'Code',
              },
              {
                value: 'preview',
                icon: Icons.window,
                label: 'Preview',
              },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'flex items-center h-7 gap-2 rounded-md shadow-none data-[state=active]:bg-muted'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2 p-2">
            <Button
              variant="ghost"
              onClick={handleScreenshot}
              disabled={!file || isScreenshotting}
              className="h-7 w-7 p-0"
            >
              {isScreenshotting ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.camera className="h-4 w-4" />
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" disabled={!file} className="h-7 w-7 p-0">
                  <Icons.api className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icons.api className="h-5 w-5" />
                    <span>Generate API</span>
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <p>Use this API to generate a page from a prompt and get its screenshot.</p>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Send a POST request with the following command:</p>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        <code className="text-sm">
                          {`curl -X POST ${'https://pages.tisvc.com'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a beautiful login page"}' \\
  --output page.png`}
                        </code>
                      </pre>
                      <CopyButton
                        className="absolute top-2 right-2 h-6 w-6"
                        text={`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'https://pages.tisvc.com'}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a beautiful login page"}' \\
  --output page.png`}
                        prompt={`Command to generate page has been copied. You can paste it into your terminal.`}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For more information on how to use this API, visit our{' '}
                    <Link href="/docs" target="_blank" className="underline hover:text-primary">
                      API documentation
                    </Link>
                    .
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <AuthButton />
          </div>
        </div>
        <div className="flex-1 h-[calc(100%-4rem)] overflow-hidden">
          <TabsContent value="code" className="h-full m-0">
            {file ? (
              <ScrollArea className="h-full w-full">
                <SyntaxHighlighter
                  language="tsx"
                  style={theme}
                  customStyle={{
                    margin: 0,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  codeTagProps={{
                    style: {
                      fontSize: '12px',
                      lineHeight: '1.4',
                    },
                  }}
                  wrapLines={true}
                  lineProps={{
                    style: {
                      background: 'transparent',
                    },
                  }}
                >
                  {file.file?.content || ''}
                </SyntaxHighlighter>
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No file selected
              </div>
            )}
          </TabsContent>
          <TabsContent value="preview" className="h-full m-0">
            {file && <PagePreview project={project} file={file} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
