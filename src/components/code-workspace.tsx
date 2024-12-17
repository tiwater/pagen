'use client'

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { CodeBlock } from "@/components/code-block"
import { NextRuntime } from "@/components/next-runtime"
import { ConsoleView } from "@/components/console-view"
import { usePage } from "@/contexts/page-context"

interface CodeWorkspaceProps {
  id: string
  isMobile?: boolean
  setIsPreviewOpen?: (open: boolean) => void
}

export function CodeWorkspace({ id, isMobile, setIsPreviewOpen }: CodeWorkspaceProps) {
  const { theme } = useTheme();
  const { page } = usePage();
  const files = page ? [page] : [];

  return (
    <div className="h-full">
      <Tabs defaultValue="preview" className="h-full w-full">
        <div className="flex items-center justify-between bg-transparent border-b">
          <TabsList className="w-full bg-transparent justify-start">
            <TabsTrigger value="preview"><Icons.window className="mr-2 h-4 w-4" />Preview</TabsTrigger>
            <TabsTrigger value="code"><Icons.code className="mr-2 h-4 w-4" />Code</TabsTrigger>
            <TabsTrigger value="console"><Icons.terminal className="mr-2 h-4 w-4" />Console</TabsTrigger>
          </TabsList>
          {isMobile && setIsPreviewOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
              <Icons.close className="h-4 w-4" />
            </Button>
          )}
        </div>
        <TabsContent value="preview" className="h-[calc(100vh-48px)] m-0">
          <NextRuntime files={files} chatId={id} />
        </TabsContent>
        <TabsContent value="code" className="h-[calc(100vh-48px)] m-0 overflow-auto">
          <div className="">
            {files.map((file) => (
              <div key={file.path} className="">
                <CodeBlock code={file.content} language="tsx" />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="console" className="h-[calc(100vh-48px)] m-0">
          <ConsoleView chatId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
