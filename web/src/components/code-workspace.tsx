"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { usePageStore } from "@/store/page";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagePreview } from "@/components/page-preview"; 
import { Icons } from "./ui/icons";
import { Button } from "./ui/button";

interface CodeWorkspaceProps {
  id: string;
  isMobile: boolean;
  setIsPreviewOpen?: (open: boolean) => void;
}

export function CodeWorkspace({
  id,
  isMobile,
}: CodeWorkspaceProps) {
  const { pages, activePage } = usePageStore();
  const activePageData = activePage ? pages[activePage] : null;

  const handleScreenshot = useCallback(async () => {
    // TODO: Implement screenshot functionality
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <Tabs defaultValue="code" className="h-full">
          <div className="flex items-center justify-between border-b">
            <TabsList className="grid grid-cols-2 bg-transparent">
              <TabsTrigger value="code">
                <Icons.code className="mr-2 h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Icons.window className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            {activePageData && (
              <div className="flex items-center gap-2 p-2">
                {activePageData.status === "generating" && (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                )}
                {activePageData.status === "complete" && (
                  <Icons.check className="h-4 w-4" />
                )}
                <Button
                  variant="ghost"
                  onClick={handleScreenshot}
                  size={'icon'}
                  className="flex items-center"
                >
                  <Icons.camera className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <TabsContent value="code" className="mt-0 flex-1">
            {!activePageData ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No page selected
              </div>
            ) : (
              <CodeBlock code={activePageData.content} />
            )}
          </TabsContent>
          <TabsContent value="preview" className="mt-0 flex-1">
            {activePageData && <PagePreview messageId={activePageData.messageId} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
