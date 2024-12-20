'use client';

import { use, useEffect, useState } from 'react';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '@/components/code-workspace';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Icons } from '@/components/icons';
import { useChat } from '@/hooks/use-chat';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { chat, isLoading } = useChat(id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Icons.warning className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <ChatUI id={id} chat={chat} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <CodeWorkspace id={id} isMobile={isMobile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}