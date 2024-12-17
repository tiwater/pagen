'use client'

import { use, useEffect, useState } from "react";
import { ChatUI } from "@/components/chat-ui";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useChatStore from "@/store/chat";
import Link from "next/link";
import Image from "next/image";
import { CodeWorkspace } from "@/components/code-workspace";
import { usePageStore } from "@/store/page";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chat = useChatStore((state) => state.chats[id]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { page } = usePageStore()

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

  console.log('page in chat page', page)
  
  return (
    <div className="h-screen">
      {isMobile ? (
        <div className="h-full">
          <div className={`h-full ${isPreviewOpen ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-2 border-b px-4 h-12">
              <span className="font-semibold">{chat.title}</span>
            </div>
            <div className="h-[calc(100vh-48px)] overflow-hidden">
              <ChatUI id={id} chat={chat} />
            </div>
          </div>
          {isPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-background">
              <CodeWorkspace id={id} isMobile={isMobile} setIsPreviewOpen={setIsPreviewOpen} />
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
                <span className="text-sm font-semibold">{chat.title}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatUI id={id} chat={chat} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <CodeWorkspace id={id} isMobile={isMobile} setIsPreviewOpen={setIsPreviewOpen} />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
