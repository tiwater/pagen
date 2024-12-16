"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { useChat } from "ai/react";
import useChatStore from "@/store/chat";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useRef, useEffect } from "react";

interface ChatUIProps {
  chatId: string;
}

interface GeneratedPage {
  path: string;
  content: string;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function PagePreview({ page }: { page: GeneratedPage }) {
  const updateGeneratedCode = useChatStore((state) => state.updateGeneratedCode);
  const chatId = useChatStore((state) => state.currentChatId);

  const handleClick = () => {
    if (chatId) {
      updateGeneratedCode(chatId, [page]);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer border border-muted hover:border-muted/80 rounded-sm m-0.5 transition-colors"
    >
      <div className="flex items-center gap-2 border-b bg-muted text-muted-foreground group-hover:bg-muted/90 p-2">
        <Icons.window className="w-4 h-4" />
        <span className="font-medium">{page.path}</span>
      </div>
      <div className="text-xs font-mono bg-white group-hover:bg-white/90 text-muted-foreground overflow-hidden text-ellipsis p-2">
        {page.content.split('\n').slice(0, 3).join('\n')}
        {page.content.split('\n').length > 3 && '...'}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex w-max max-w-[80%] ml-auto bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm">
        {message.content}
      </div>
    );
  }

  return (
    <div className="flex w-max max-w-[80%] flex-col gap-3">
      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-semibold mb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mb-2">{children}</h2>
            ),
            p: ({ children }) => (
              <p className="mb-4 last:mb-0">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 mb-4 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 mb-4 space-y-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm">{children}</li>
            ),
            code: ({ inline, className, children, ...props }: CodeProps) => {
              const language = /language-(\w+)/.exec(className || '')?.[1];

              if (inline) {
                return (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                );
              }

              if (language === 'pagen') {
                try {
                  const page: GeneratedPage = {
                    path: 'app/page.tsx',
                    content: String(children).replace(/\n$/, '')
                  };
                  return <PagePreview page={page} />;
                } catch (error) {
                  console.error('Failed to parse pagen block:', error);
                }
              }

              return (
                <pre className="not-prose bg-muted rounded-lg p-3 mb-4">
                  <code className="text-xs font-mono block whitespace-pre" {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function ChatUI({ chatId }: ChatUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateGeneratedCode = useChatStore((state) => state.updateGeneratedCode);
  const chat = useChatStore((state) => state.chats[chatId]);
  const markChatInitialized = useChatStore((state) => state.markChatInitialized);

  const { messages, setMessages, input, handleInputChange, handleSubmit: onSubmit, append } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: chat?.messages || [],
    onFinish: (message) => {
      console.log('onFinish:', message);
      addMessage(chatId, { id: chatId + Date.now(), role: 'assistant', content: message.content });
      
      // Extract and update generated code if present
      const codeMatch = message.content.match(/```(?:jsx|tsx|pagen)?\n([\s\S]*?)```/);
      if (codeMatch) {
        const files = [{
          path: 'app/page.tsx',
          content: codeMatch[1].trim()
        }];
        // Update code immediately when we get it
        updateGeneratedCode(chatId, files);
      }
      
      // Mark chat as initialized after receiving first response
      if (chat?.isNew) {
        markChatInitialized(chatId);
      }
    }
  });

  // Auto-trigger chat for initial message
  useEffect(() => {
    if (chat?.isNew && chat.messages.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.role === 'user') {
        // Remove the last message from useChat state before appending
        setMessages(messages.slice(0, -1));
        append(lastMessage);
        markChatInitialized(chatId);
      }
    }
  }, [chat, append, messages, setMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add message to store first
    addMessage(chatId, { id: chatId + Date.now(), role: 'user', content: input });
    
    // Then submit to API
    onSubmit(e);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
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
