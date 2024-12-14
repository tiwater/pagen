'use client'

import { ChatUI } from "@/components/chat-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewFrame } from "@/components/preview-frame";
import { generateNextProject } from "@/lib/project-generator";
import { useChatStore } from "@/lib/store";

export default function ChatPage({ params }: { params: { id: string }}) {
  const messages = useChatStore((state) => state.messages[params.id] || [])
  
  // Get the latest assistant message for preview
  const latestContent = messages
    .filter(msg => msg.role === 'assistant')
    .pop()?.content || ''

  const files = generateNextProject(latestContent)

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 border-b px-4 h-12">
          <span className="font-semibold">Chat</span>
          <span className="text-xs text-muted-foreground">Private</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatUI chatId={params.id} />
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
            <pre className="text-sm">
              <code>{JSON.stringify(files, null, 2)}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
