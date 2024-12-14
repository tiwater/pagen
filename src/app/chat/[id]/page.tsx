'use client'

import { ChatUI } from "@/components/chat-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewFrame } from "@/components/preview-frame";
import useChatStore from "@/store/chat";
import { use } from "react";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const chat = useChatStore((state) => state.chats[id])
  
  // If no chat exists, show loading or error state
  if (!chat) {
    return <div>Chat not found</div>
  }

  // Get the generated code from the store
  const files = chat.generatedCode?.files || [];

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col max-w-1/2">
        <div className="flex items-center gap-2 border-b px-4 h-12">
          <span className="font-semibold">{chat.title}</span>
          <span className="text-xs text-muted-foreground">Private</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatUI chatId={id} />
        </div>
      </div>
      <div className="w-[600px] border-l">
        <Tabs defaultValue="preview">
          <div className="flex items-center justify-between border-b px-4 h-12">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="h-[calc(100vh-48px)]">
            <PreviewFrame files={files} />
          </TabsContent>
          <TabsContent value="code" className="p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {files.map((file) => (
                <div key={file.path} className="mb-8">
                  <div className="font-medium mb-2">{file.path}</div>
                  <code className="block bg-muted p-4 rounded-lg">
                    {file.content}
                  </code>
                </div>
              ))}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
