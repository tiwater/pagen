'use client';

import { useEffect, useState } from 'react';
import useChatStore from '@/store/chat';
import { Project } from '@/store/project';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '@/components/code-workspace';
import { Icons } from '@/components/icons';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface PageLayoutProps {
  project: Project;
}

export function PageLayout({ project }: PageLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const chat = useChatStore(state =>
    project.chatId ? state.getChats().find(c => c.id === project.chatId) : null
  );

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

  if (!project.chatId || !chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.warning className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No chat associated with this project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col w-full">
      <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <ChatUI id={chat.id} chat={chat} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <CodeWorkspace id={chat.id} isMobile={isMobile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
