'use client'

import { useEffect, useState } from "react";
import { ChatUI } from "@/components/chat-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewFrame } from "@/components/preview-frame";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import useChatStore from "@/store/chat";
import { use } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { useTheme } from 'next-themes';
import Image from "next/image";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chat = useChatStore((state) => state.chats[id]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsPreviewOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!chat) {
    return <div>Chat not found</div>
  }

  const files = chat.generatedCode?.files || [];

  const PreviewPanel = () => {
    const { theme } = useTheme();
    
    return (
      <div className="h-full">
        <Tabs defaultValue="preview" className="h-full">
          <div className="flex items-center justify-between border-b px-4 h-12">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                <Icons.close className="h-4 w-4" />
              </Button>
            )}
          </div>
          <TabsContent value="preview" className="h-[calc(100vh-48px)] m-0">
            <PreviewFrame files={files} />
          </TabsContent>
          <TabsContent value="code" className="h-[calc(100vh-48px)] m-0 overflow-auto">
            <div className="p-4">
              {files.map((file) => (
                <div key={file.path} className="mb-8">
                  <div className="font-medium mb-2 text-xs">{file.path}</div>
                  <CodeBlock code={file.content} language="tsx" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="h-screen">
      {isMobile ? (
        <div className="h-full">
          <div className={`h-full ${isPreviewOpen ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-2 border-b px-4 h-12">
              <span className="font-semibold">{chat.title}</span>
            </div>
            <div className="h-[calc(100vh-48px)] overflow-hidden">
              <ChatUI chatId={id} />
            </div>
          </div>
          {isPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-background">
              <PreviewPanel />
            </div>
          )}
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b px-4 h-12">
                <Link
                  href="/"
                  className="inline-flex items-center hover:opacity-80"
                >
                  <Image src="/images/logo.svg" width={20} height={20} alt="Logo" />
                </Link>
                <span className="font-semibold">{chat.title}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatUI chatId={id} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <PreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
