"use client";

import { use, useEffect, useState } from "react";
import { ChatUI } from "@/components/chat-ui";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import useChatStore from "@/store/chat";
import Link from "next/link";
import Image from "next/image";
import { CodeWorkspace } from "@/components/code-workspace";
import { usePageStore } from "@/store/page";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const chat = useChatStore((state) => state.chats[id]);
  const [isMobile, setIsMobile] = useState(false);
  const { page } = usePageStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!chat) {
    return <div>Chat not found</div>;
  }

  console.log("page in chat page", page);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
          </Link>
          <div className="text-sm font-medium">
            {chat.title || "New Chat"}
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatUI id={id} chat={chat} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <CodeWorkspace id={id} isMobile={isMobile} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
