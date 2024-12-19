'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useChatStore from '@/store/chat';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '@/components/code-workspace';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chat = useChatStore(state => state.chats[id]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!chat) {
    return <div>Chat not found</div>;
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
