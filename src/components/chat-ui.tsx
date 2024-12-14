"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import useChatStore from "@/store/chat";

interface ChatUIProps {
  chatId: string;
}

export function ChatUI({ chatId }: ChatUIProps) {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateGeneratedCode = useChatStore((state) => state.updateGeneratedCode);

  const { messages, input, handleInputChange, handleSubmit: onSubmit } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: [],
    onFinish: (message) => {
      console.log('onFinish:', message);
      addMessage(chatId, { id: chatId + Date.now(), role: 'assistant', content: message.content });
      
      // Extract and update generated code if present
      const codeMatch = message.content.match(/```(?:jsx|tsx)?\n([\s\S]*?)```/);
      if (codeMatch) {
        const files = [{
          path: 'app/page.tsx',
          content: codeMatch[1].trim()
        }];
        updateGeneratedCode(chatId, files);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to store first
    addMessage(chatId, { id: chatId + Date.now(), role: 'user', content: input });
    
    // Then submit to API
    onSubmit(e);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <Button type="submit" size="icon">
            <Icons.send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
