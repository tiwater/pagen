'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '@/components/code-workspace';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface PageLayoutProps {
  project: Project;
}

export function PageLayout({ project }: PageLayoutProps) {
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

  return (
    <div className="flex h-screen flex-col w-full">
      <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'} className="flex-1">
        <ResizablePanel defaultSize={40} minSize={15}>
          <ChatUI project={project} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={40}>
          <CodeWorkspace id={project.id} isMobile={isMobile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
