"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { usePageStore } from "@/store/page";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagePreview } from "@/components/page-preview"; 
import { Icons } from "./ui/icons";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <Tabs defaultValue="code" className="flex-1 h-full flex flex-col">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Icons.terminal className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Icons.window className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          {activePageData && (
            <div className="flex items-center gap-2 p-2">
              {activePageData.status === "generating" && (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              )}
              {activePageData.status === "complete" && (
                <Icons.checkCircle className="h-4 w-4" />
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
        <div className="flex-1 h-[calc(100%-4rem)] overflow-hidden">
          <TabsContent value="code" className="h-full m-0">
            {activePageData ? (
              <ScrollArea className="h-full">
                  <CodeBlock
                    code={activePageData.content || ""}
                    language="tsx"
                  />
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
