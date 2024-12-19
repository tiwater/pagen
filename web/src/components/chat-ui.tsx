"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePageStore } from "@/store/page";
import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";
import useChatStore from "@/store/chat";
import { useState, useEffect, useRef } from "react";
import { Icons } from "./ui/icons";

interface ChatUIProps {
  id: string;
  chat: Chat | null;
}

interface PageBlock {
  path: string;
  content: string;
  status: string;
  id: string;
  metadata: {
    title: string;
    version?: string;
    description?: string;
  };
}

function PageBlock({ messageId }: { messageId: string }) {
  const { pages, setActivePage } = usePageStore();
  const page = pages[messageId];
  if (!page) return null;

  return (
    <div
      className="my-2 rounded border p-2 hover:bg-muted/50 cursor-pointer"
      onClick={() => setActivePage(messageId)}
    >
      <div className="flex items-center gap-2">
        <Icons.code className="h-4 w-4" />
        <span className="font-mono text-sm">{page.metadata.title}</span>
        {page.status === 'generating' && (
          <Icons.spinner className="h-3 w-3 animate-spin" />
        )}
      </div>
    </div>
  );
}

function ChatMessage({ message, className, ...props }: { message: any; className?: string; [key: string]: any }) {
  const { updatePage } = usePageStore();

  // Process page code blocks when receiving assistant message
  useEffect(() => {
    if (message.role !== 'assistant') return;

    // Find page code block start
    const startMatch = message.content.match(/```pagen\s*(\S+)\s+/);
    if (!startMatch) return;

    const [fullMatch, path] = startMatch;
    const startIdx = startMatch.index! + fullMatch.length;
    const title = path.split('/').pop()?.replace(/\.tsx$/, '') || 'Generated Page';
    
    // Check if code block is complete
    const endMatch = message.content.slice(startIdx).match(/```/);
    const content = endMatch 
      ? message.content.slice(startIdx, startIdx + endMatch.index).trim()
      : message.content.slice(startIdx).trim();
    
    updatePage({
      messageId: message.id,
      content,
      status: endMatch ? 'complete' : 'generating',
      metadata: {
        title
      }
    });
  }, [message.id, message.content, message.role, updatePage]);

  return (
    <div
      className={cn("group relative flex items-start", className)}
      {...props}
    >
        <div
          className="inline-flex items-start gap-2 rounded-lg text-sm font-medium"
        >
          <div className="p-2 rounded-full bg-muted">
          {message.role === "user" ? <Icons.user className="h-4 w-4 shrink-0" /> : <Icons.bot className="h-4 w-4 shrink-0" />}
          </div>
          <div className={cn("flex flex-col space-y-1 leading-normal p-2 rounded-lg", message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({
                node,
                className,
                children,
                ...props
              }) {
                const language = /language-(\w+)/.exec(className || '')?.[1];
                if (language === 'pagen') {
                  const match = /```pagen\s*(\S+)\s+/g.exec(children?.toString() || '');
                  if (match) {
                    return <PageBlock messageId={message.id} />;
                  }
                  return null;
                }
                return (
                  <code
                    className={className}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
      </div>
      </div>
    </div>
  );
}

function EmptyScreen({ setInput }: { setInput: (input: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Pagen AI</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is an AI-powered web page generator. Describe what you want to
          create and I&apos;ll help you build it.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {[
            "Create a login form with a modern design",
            "Build a pricing page with three tiers",
            "Design a hero section with a call-to-action",
          ].map((example) => (
            <Button
              key={example}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(example)}
            >
              <span className="text-muted-foreground">&rarr;</span> {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatUI({ id: chatId, chat }: ChatUIProps) {
  const { addMessage, markChatInitialized } = useChatStore();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/generate",
    id: chatId,
    initialMessages: chat?.messages || [],
    body: {
      id: chatId,
      title: chat?.title,
    },
    onFinish: response => {
      console.log('Chat finished:', response)
      addMessage(chatId, {
        id: response.id,
        role: response.role,
        content: response.content,
        createdAt: response.createdAt,
      });
      markChatInitialized(chatId);
    }
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input?.trim()) {
        return;
      }
      onSubmit(e);
    },
    [input, onSubmit]
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col flex-1 overflow-y-auto px-2 gap-4">
        {messages.length ? (
          messages.map((message, i) => (
            <ChatMessage key={message.id || i} message={message} />
          ))
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t bg-background p-4">
        <div className="relative flex w-full overflow-hidden bg-background gap-2">
          <Textarea
            tabIndex={0}
            rows={1}
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message"
            spellCheck={false}
            className="w-full sm:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || input === ""}
            className="shrink-0"
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
