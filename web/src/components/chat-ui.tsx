'use client';

import { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
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
import { Rule } from '@/types/rules';
import { useSettingsStore } from '@/store/setting';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatMessageProps {
  message: Message;
  chat: Chat;
  className?: string;
}

const MemoizedPageCard = memo(PageCard);

function ChatMessage({ message, chat, className }: ChatMessageProps) {
  const { updatePage, setActivePage } = usePageStore();
  const lastContentRef = useRef<string>();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const { rules } = useSettingsStore();
  const selectedRuleId = rules.find(rule => rule.id === message.id)?.id;

  useEffect(() => {
    if (message.role !== 'assistant') return;

    const startMatch = message.content.match(/```(?:pagen|tsx|jsx)\n/);
    if (!startMatch) return;

    const startIdx = startMatch.index! + startMatch[0].length;
    const endMatch = message.content.slice(startIdx).match(/```/);
    const content = endMatch && typeof endMatch.index !== 'undefined'
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

  const renderCodeBlock = useCallback(({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const language = /language-(\w+)/.exec(className || '')?.[1];
    if (language === 'pagen') {
      return <MemoizedPageCard key={message.id} messageId={message.id} />;
    }
    return <code className={className}>{children}</code>;
  }, [message.id]);

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
      {content}
    </ReactMarkdown>
  ));

  return (
    <div className={cn('group relative flex items-start', className)}>
      <div className="inline-flex items-start gap-1 rounded-lg text-sm font-medium">
        <div
          className={cn(
            'rounded-full bg-muted',
            message.role === 'user' ? 'bg-primary/90 text-primary-foreground' : 'bg-primary/90 text-primary-foreground'
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
  id: string;
  chat: Chat;
}

function handleSettingsClick() {
  // Implement the logic to open settings or navigate to the settings page
  console.log('Settings button clicked');
}

export function ChatUI({ id, chat }: ChatUIProps) {
  const { addMessage, markChatInitialized } = useChatStore();
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const { rules } = useSettingsStore();
  const selectedRule = rules.find(rule => rule.id === selectedRuleId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const initialMessages = useMemo(() => {
    return chat?.isNew ? [] : (chat?.messages || []);
  }, [chat?.isNew, chat?.id]); // Only depend on isNew and id, not the messages

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
    id: id,
    initialMessages,
    body: {
      id: id,
      title: chat?.title,
      rules: selectedRule ? [selectedRule] : [],
    },
    experimental_throttle: 300,
    onFinish: response => {
      console.log('Chat finished:', response);
      setIsGenerating(false);
      if (!chat?.messages?.find(m => m.id === response.id)) {
        addMessage(id, {
          id: response.id,
          role: response.role,
          content: response.content,
          createdAt: response.createdAt,
        });
      }
    },
  });

  useEffect(() => {
    if (chat?.isNew && chat.messages.length === 1) {
      setMessages([]);
      append(chat.messages[0]);
      markChatInitialized(id);
    }
  }, [chat]);

  useEffect(() => {
    console.log('messages', messages);
    const scrollToBottom = () => {
      const element = messagesEndRef.current;
      if (!element) return;

      // Use requestAnimationFrame to optimize performance
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      });
    };

    // Debounce scroll updates
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]); // Only run when messages change

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

    // Store the input value before clearing it
    const currentInput = input;

    // Clear the input immediately
    setInput('');

    append({
      id: messageId,
      content: currentInput,
      role: 'user',
      createdAt: new Date(),
    });

    // Add to local store first
    addMessage(id, {
      id: messageId,
      role: 'user',
      content: currentInput,
      createdAt: new Date(),
    });

    // Only append if it's not already the last message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== currentInput) {

    }
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
          <ChatMessage
            key={message.id || i}
            message={message}
            chat={chat}
          />
        ))}
      </>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={24} height={24} />
            <span className="font-semibold">Pagen</span>
          </Link>
          <span className="text-sm text-muted-foreground">{chat.title || 'New Chat'}</span>
          {isLoading && (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          )}
        </div>

      </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="absolute left-1 bottom-1 shrink-0 h-7 flex items-center gap-1 px-2 text-sm">
                {selectedRuleId ? (
                  <>
                    <Icons.listTodo className="h-4 w-4 shrink-0" />
                    <span className="text-xs text-muted-foreground">{selectedRule?.title}</span>
                  </>
                ) : (
                  <>
                    <Icons.listTodo className="h-4 w-4 shrink-0" />
                    <span className="text-xs text-muted-foreground">Rules</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {rules.slice(0, 5).map((rule, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={cn(selectedRuleId === rule.id && 'bg-primary/10 border-primary/20')}
                >
                  <Icons.listTodo className="h-4 w-4 shrink-0" />
                  {rule.title}
                </DropdownMenuItem>
              ))}
              {rules.length > 0 && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem>
                <Link href="/settings/rules" className="flex items-center gap-2 w-full">
                  <Icons.settings className="h-4 w-4" />
                  Configure Rules...
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="submit"
            size="sm"
            disabled={!isLoading && input === ''}
            className={cn(
              'absolute right-1 bottom-1 shrink-0 h-7 w-auto flex items-center gap-1 px-2 text-sm',
              isLoading && 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {isLoading ? <Icons.square className="h-4 w-4" /> : <Icons.send className="h-4 w-4" />}
            {isLoading ? 'Stop' : 'Send'}
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