"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";

interface ChatUIProps {
  chatId: string;
}

export function ChatUI({ chatId }: ChatUIProps) {
  const { messages, isLoading, sendMessage } = useChat(chatId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLTextAreaElement;
    
    await sendMessage(input.value);
    input.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
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
        <div className="flex gap-4">
          <Textarea
            name="message"
            placeholder="Type a message..."
            className="min-h-[44px] rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
