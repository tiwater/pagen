'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import useChatStore from '@/store/chat';
import { usePageStore } from '@/store/page';
import { Chat } from '@/types/chat';
import { Message, useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { PageCard } from '@/components/page-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Icons } from './icons';
import { ScrollArea } from './ui/scroll-area';


interface ChatMessageProps {
  message: Message;
  chat: Chat;
  className?: string;
}

function ChatMessage({ message, chat, className }: ChatMessageProps) {
  const { updatePage, setActivePage } = usePageStore();
  const lastContentRef = useRef<string>();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const messages = chat.messages;

  useEffect(() => {
    if (message.role !== 'assistant') return;

    const startMatch = message.content.match(/```(?:pagen|tsx|jsx)\n/);
    if (!startMatch) return;

    const startIdx = startMatch.index! + startMatch[0].length;
    const endMatch = message.content.slice(startIdx).match(/```/);
    const content =
      endMatch && typeof endMatch.index !== 'undefined'
        ? message.content.slice(startIdx, startIdx + endMatch.index).trim()
        : message.content.slice(startIdx).trim();

    if (content !== lastContentRef.current) {
      // Clear any pending update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce the update
      updateTimeoutRef.current = setTimeout(() => {
        lastContentRef.current = content;
        // Find the user message that triggered this response
        const userMessage = chat.messages.find(
          (msg, index) => msg.role === 'user' && chat.messages[index + 1]?.id === message.id
        );

        updatePage({
          messageId: message.id,
          content,
          prompt: userMessage?.content || '',
          status: endMatch ? 'complete' : 'generating',
          metadata: {
            title: 'Generated Page',
          },
        });

        if (!lastContentRef.current || endMatch) {
          setActivePage(message.id);
        }
      }, 300); // 300ms debounce

      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }
  }, [message.content, message.role, message.id, updatePage, setActivePage, chat.messages]);

  const renderCodeBlock = ({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const language = /language-(\w+)/.exec(className || '')?.[1];
    if (language === 'pagen') {
      return <PageCard key={message.id} messageId={message.id} />;
    }
    return <code className={className}>{children}</code>;
  };

  return (
    <div className={cn('group relative flex items-start', className)}>
      <div className="inline-flex items-start gap-1 rounded-lg text-sm font-medium">
        <div className="p-1 rounded-full bg-muted">
          {message.role === 'user' ? (
            <Icons.user className="h-4 w-4 shrink-0" />
          ) : (
            <Icons.bot className="h-4 w-4 shrink-0" />
          )}
        </div>
        <div
          className={cn(
            'flex-1 flex flex-col space-y-1 leading-normal p-2 rounded-lg min-w-0',
            message.role === 'user'
              ? 'bg-primary/60 text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code: renderCodeBlock,
              ul: ({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
                <ul className={cn('list-disc pl-6 mb-4 space-y-2', className)} {...props}>
                  {children}
                </ul>
              ),
              ol: ({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
                <ol className={cn('list-decimal pl-6 mb-4 space-y-2', className)} {...props}>
                  {children}
                </ol>
              ),
              li: ({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
                <li className={cn('leading-relaxed', className)} {...props}>
                  {children}
                </li>
              ),
              p: ({
                className,
                children,
                ...props
              }: React.HTMLAttributes<HTMLParagraphElement>) => (
                <p className={cn('leading-relaxed', className)} {...props}>
                  {children}
                </p>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

interface ChatUIProps {
  id: string;
  chat: Chat;
}

export function ChatUI({ id: chatId, chat }: ChatUIProps) {
  const { addMessage, markChatInitialized } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    isLoading,
    setInput,
    append,
    setMessages,
    stop,
  } = useChat({
    id: chatId,
    initialMessages: chat?.messages || [],
    body: {
      id: chatId,
      title: chat?.title,
    },
    onFinish: response => {
      console.log('Chat finished:', response);
      addMessage(chatId, {
        id: response.id,
        role: response.role,
        content: response.content,
        createdAt: response.createdAt,
      });
    },
  });

  useEffect(() => {
    if (chat?.isNew && chat.messages.length > 0) {
      setMessages([]);
      append(chat.messages[0]);
      markChatInitialized(chatId);
    }
  }, [chat]);

  useEffect(() => {
    const scrollToBottom = () => {
      const element = messagesEndRef.current;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          const container = element.parentElement;
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      }
    };

    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      stop();
      return;
    }
    if (!input?.trim()) {
      return;
    }

    addMessage(chatId, {
      id: nanoid(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    });
    onSubmit(e);
  };

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
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={24} height={24} />
            <span className="font-semibold">Pagen</span>
          </Link>
          <span className="text-sm text-muted-foreground">{chat.title || 'New Chat'}</span>
        </div>
      </div>
      <ScrollArea className="flex-1 flex flex-col justify-start">
        <div className="flex flex-col p-2 pr-3 gap-2">
          {messages.length ? (
            <>
              {messages.map((message, i) => (
                <ChatMessage key={message.id || i} message={message} chat={chat} />
              ))}
            </>
          ) : (
            <EmptyScreen setInput={setInput} />
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="border-t bg-background p-1">
        <div className="relative flex w-full overflow-hidden bg-background gap-2">
          <Textarea
            tabIndex={0}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message"
            spellCheck={false}
            className="w-full sm:text-sm resize-none overflow-hidden bg-background border-0 focus:ring-0 focus-visible:ring-0 focus:border-primary/20 focus-visible:border-primary/20 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isLoading && input === ''}
            className={cn('absolute right-1 bottom-1 shrink-0 h-7 w-7', isLoading && 'bg-red-500 text-white hover:bg-red-600')}
          >
            {isLoading ? (
              <Icons.square className="h-4 w-4" />
            ) : (
              <Icons.send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyScreen({ setInput }: { setInput: (input: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Pagen AI</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is an AI-powered web page generator. Describe what you want to create and I&apos;ll
          help you build it.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {[
            'Create a login form with a modern design',
            'Build a pricing page with three tiers',
            'Design a hero section with a call-to-action',
          ].map(example => (
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