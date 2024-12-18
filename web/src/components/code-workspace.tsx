"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { usePageStore } from "@/store/page";
import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Code2, Loader2 } from "lucide-react";

interface CodeWorkspaceProps {
  id: string;
  isMobile: boolean;
  setIsPreviewOpen?: (open: boolean) => void;
}

export function CodeWorkspace({
  id,
  isMobile,
  setIsPreviewOpen,
}: CodeWorkspaceProps) {
  const { theme } = useTheme();
  const { page, status } = usePageStore();
  const files = page ? [page] : [];

  const handleScreenshot = useCallback(async () => {
    // TODO: Implement screenshot functionality
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 h-12">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">Code Editor</span>
        </div>
        {isMobile && setIsPreviewOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreviewOpen(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full">
          <div className="flex items-center justify-between border-b px-4">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="editor" className="h-[calc(100%-41px)]">
            {status === "generating" ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              files.map((file) => (
                <div key={file.path} className="p-4">
                  <CodeBlock code={file.content} language="tsx" />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
