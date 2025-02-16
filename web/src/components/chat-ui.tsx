'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { usePageStore } from '@/store/page';
import useProjectStore from '@/store/project';
import { useSettingsStore } from '@/store/setting';
import { Project } from '@/types/project';
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
  chat: {
    id: string;
    projectId: string;
    messages: Message[];
  };
  className?: string;
}

const MemoizedPageCard = memo(PageCard);

function ChatMessage({ message, chat, className }: ChatMessageProps) {
  const { updatePage, setActivePage } = usePageStore();
  const lastContentRef = useRef<string>();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

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

        // Always set as active when we update the page
        setActivePage(message.id);
      }, 300);

      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }
  }, [message.content, message.role, message.id, updatePage, setActivePage, chat.messages]);

  const renderCodeBlock = useCallback(
    ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const language = /language-(\w+)/.exec(className || '')?.[1];
      if (language === 'pagen') {
        return <MemoizedPageCard key={message.id} messageId={message.id} />;
      }
      return <code className={className}>{children}</code>;
    },
    [message.id]
  );

  const MemoizedMarkdown = memo(({ content }: { content: string }) => (
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
        p: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p className={cn('leading-relaxed', className)} {...props}>
            {children}
          </p>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  ));

  MemoizedMarkdown.displayName = 'MemoizedMarkdown';

  return (
    <div className={cn('group relative flex items-start', className)}>
      <div className="inline-flex items-start gap-1 rounded-lg text-sm font-medium">
        <div
          className={cn(
            'rounded-full bg-muted',
            message.role === 'user'
              ? 'bg-primary/90 text-primary-foreground'
              : 'bg-primary/90 text-primary-foreground'
          )}
        >
          {message.role === 'user' ? (
            user?.user_metadata.avatar_url ? (
              <Image
                src={user?.user_metadata.avatar_url}
                alt="avatar"
                width={24}
                height={24}
                className="rounded-full h-7 w-7 shrink-0"
              />
            ) : (
              <Icons.user className="m-1 h-5 w-5 shrink-0" />
            )
          ) : (
            <Image
              src="/images/logo.svg"
              alt="avatar"
              width={24}
              height={24}
              className="rounded-full h-7 w-7 shrink-0"
            />
          )}
        </div>
        <div
          className={cn(
            'flex-1 flex flex-col space-y-1 leading-normal p-2 rounded-lg min-w-0',
            message.role === 'user'
              ? 'bg-primary/90 text-primary-foreground'
              : 'bg-muted-foreground/5 text-muted-foreground'
          )}
        >
          <MemoizedMarkdown content={message.content} />
        </div>
      </div>
    </div>
  );
}

interface ChatUIProps {
  project: Project;
}

export function ChatUI({ project }: ChatUIProps) {
  const { updateProject } = useProjectStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!project.chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Icons.warning className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No chat found</p>
        </div>
      </div>
    );
  }

  const initialMessages = useMemo(() => {
    return project.isNew ? [] : project.chat.messages;
  }, [project.isNew, project.chat.messages]);

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
    id: project.chat.id,
    initialMessages,
    body: {
      id: project.chat.id,
      title: project.title,
    },
    experimental_throttle: 300,
    onFinish: (response: Message) => {
      console.log('Chat finished:', response);
      setIsGenerating(false);
      if (!project.chat.messages.find((m: Message) => m.id === response.id)) {
        updateProject(project.id, {
          chat: {
            ...project.chat,
            messages: [...project.chat.messages, response],
          },
        });
      }
    },
  });

  // Scroll to bottom effect with debounce
  useEffect(() => {
    const element = messagesEndRef.current;
    if (!element) return;

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      });
    }, 100);

    return () => clearTimeout(timeoutId);
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

    const messageId = nanoid();
    setIsGenerating(true);

    const currentInput = input;
    setInput('');

    const newMessage = {
      id: messageId,
      content: currentInput,
      role: 'user' as const,
      createdAt: new Date(),
    };

    append(newMessage);

    updateProject(project.id, {
      chat: {
        ...project.chat,
        messages: [...project.chat.messages, newMessage],
      },
    });
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

  const renderMessages = () => {
    return (
      <>
        {messages.map((message, i) => (
          <ChatMessage key={message.id || i} message={message} chat={project.chat} />
        ))}
      </>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 flex flex-col justify-start">
        <div className="flex flex-col p-2 pr-3 gap-2">
          {messages.length ? renderMessages() : <EmptyScreen setInput={setInput} />}
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
            size="sm"
            disabled={!isLoading && input === ''}
            className={cn(
              'absolute right-1 bottom-1 shrink-0 h-7 w-auto flex items-center gap-1 px-2 text-sm',
              isLoading && 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {isLoading ? 'stop' : 'submit'}
            {isLoading ? (
              <Icons.square className="h-3 w-3" />
            ) : (
              <Icons.cornerDownLeft className="h-3 w-3" />
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
