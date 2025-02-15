'use client';

import { useCallback, useRef } from 'react';
import useChatStore from '@/store/chat';
import { Chat } from '@/types/chat';
import { Message } from 'ai';
import { useChat } from 'ai/react';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

interface SiteChatPanelProps {
  chat: Chat;
}

export function SiteChatPanel({ chat }: SiteChatPanelProps) {
  const { addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    isLoading,
    setInput,
    append,
    stop,
  } = useChat({
    id: chat.id,
    initialMessages: chat.messages,
    body: {
      id: chat.id,
      title: chat.title,
      activeFileId: chat.activeFileId,
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isLoading) {
        stop();
        return;
      }
      if (!input?.trim()) {
        return;
      }

      const currentInput = input;
      setInput('');

      append({
        id: crypto.randomUUID(),
        content: currentInput,
        role: 'user',
        createdAt: new Date(),
      });

      addMessage(chat.id, {
        id: crypto.randomUUID(),
        role: 'user',
        content: currentInput,
        createdAt: new Date(),
      });
    },
    [input, isLoading, append, setInput, stop, chat.id, addMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && input?.trim()) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={message.id || i}
              className={cn(
                'flex items-start gap-2 text-sm',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[85%]',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input?.trim() && !isLoading}
            className={cn('shrink-0', isLoading && 'bg-destructive hover:bg-destructive')}
          >
            {isLoading ? <Icons.square className="h-4 w-4" /> : <Icons.send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
