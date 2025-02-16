'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useProject } from '@/hooks/use-project';
import { usePageStore } from '@/store/page';
import { Project } from '@/types/project';
import { Message, useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Icons } from '@/components/icons';
import { PageCard } from '@/components/page-card';
import { SiteGenerationProgress } from '@/components/site-generation-progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
  const { updatePage } = usePageStore();
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
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

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
      }, 300);

      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }
  }, [message.content, message.role, message.id, updatePage, chat.messages]);

  const renderCodeBlock = useCallback(
    ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const language = /language-(\w+)/.exec(className || '')?.[1];
      if (language === 'pagen' || language === 'tsx' || language === 'jsx') {
        return <PageCard messageId={message.id} />;
      }
      return <code className={className}>{children}</code>;
    },
    []
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
                width={12}
                height={12}
                className="rounded-full h-5 w-5 shrink-0"
              />
            ) : (
              <Icons.user className="h-5 w-5 shrink-0" />
            )
          ) : (
            <Image
              src="/images/logo.svg"
              alt="avatar"
              width={24}
              height={24}
              className="rounded-full h-5 w-5 shrink-0"
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
  const { updateProject, isUpdating } = useProject(project.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFiles, setGenerationFiles] = useState<
    Array<{
      path: string;
      type: 'page' | 'layout';
      status: 'pending' | 'generating' | 'complete' | 'error';
    }>
  >([]);
  const [currentFile, setCurrentFile] = useState<string>();

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
    api: '/api/chat',
    id: project.chat.id,
    initialMessages: project.isNew ? [] : project.chat.messages,
    body: {
      id: project.chat.id,
      title: project.title,
      type: project.projectType,
      context: {
        path: currentFile,
        pageTree: project.pageTree,
      },
    },
    onResponse: (response: Response) => {
      const text = response.headers.get('x-completion-text');
      if (text) {
        try {
          const plan = JSON.parse(text);
          if (plan.files) {
            const files = plan.files.map((f: any) => ({
              ...f,
              status: 'pending',
            }));
            setGenerationFiles(files);

            // Start with the first file
            if (files.length > 0) {
              handleGenerateNextFile(files[0]);
            }
          }
        } catch (e) {
          console.error('Failed to parse generation plan:', e);
        }
      }
    },
    onFinish: (message: Message) => {
      setIsGenerating(false);

      // Extract all code blocks from the message
      const codeBlocks = message.content.match(/```(?:tsx|jsx)?\n([\s\S]*?)```/g);
      if (!codeBlocks) return;

      // Process each code block
      codeBlocks.forEach(block => {
        const pathMatch = block.match(/\/\/ Path: (.+\.tsx)/);
        if (!pathMatch) return;

        const path = pathMatch[1];
        const codeMatch = block.match(/```(?:tsx|jsx)?\n([\s\S]*?)```/);
        if (!codeMatch) return;

        const content = codeMatch[1].trim();

        // Update file status if it's the current file
        if (path === currentFile) {
          setGenerationFiles(files =>
            files.map(f => (f.path === path ? { ...f, status: 'complete' } : f))
          );
        }

        // Update pageTree
        handleUpdatePageTree({ path, content });
      });

      // Find and generate next file
      const nextFile = generationFiles.find(f => f.status === 'pending');
      if (nextFile) {
        handleGenerateNextFile(nextFile);
      }
    },
  });

  const handleGenerateNextFile = useCallback(
    (nextFile: { path: string; type: 'page' | 'layout' }) => {
      setCurrentFile(nextFile.path);
      setGenerationFiles(files =>
        files.map(f => (f.path === nextFile.path ? { ...f, status: 'generating' } : f))
      );
      append({
        role: 'user',
        content: `Generate the file: ${nextFile.path}`,
      });
    },
    [append]
  );

  const handleUpdatePageTree = useCallback(
    (newFile: { path: string; content: string }) => {
      // Normalize the path to use app router convention
      const normalizedPath = newFile.path
        .replace(/^pages\//, 'app/')
        .replace(/index\.tsx$/, 'page.tsx');

      // Create the file node
      const fileNode = {
        id: nanoid(),
        path: normalizedPath,
        file: {
          id: nanoid(),
          name: normalizedPath.split('/').pop() || '',
          content: newFile.content,
          metadata: {
            title: normalizedPath,
          },
        },
      };

      // Get the current pageTree or initialize it
      const currentPageTree = project.pageTree || [];
      const existingFileIndex = currentPageTree.findIndex(f => f.path === normalizedPath);

      // Create a new pageTree array with the updated or new file
      const updatedPageTree =
        existingFileIndex !== -1
          ? currentPageTree.map((f, i) => (i === existingFileIndex ? fileNode : f))
          : [...currentPageTree, fileNode];

      // Update the project with the new pageTree
      updateProject(project.id, {
        pageTree: updatedPageTree,
      });

      // Log for debugging
      console.log('Updated pageTree:', {
        originalPath: newFile.path,
        normalizedPath,
        existingFileIndex,
        pageTreeLength: updatedPageTree.length,
      });
    },
    [project.id, project.pageTree, updateProject]
  );

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
          <ChatMessage key={`${message.id}-${i + 1}`} message={message} chat={project.chat} />
        ))}
      </>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Icons.logo className="h-5 w-5" />
          </Link>
          <span>Pages</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              // Update the project in the database
              await updateProject(project.id, {
                chat: {
                  ...project.chat,
                  messages: [],
                },
              });
              // Clear the local messages state
              setMessages([]);
            }}
            disabled={isUpdating}
            className="hover:text-red-500 w-7 h-7"
          >
            {isUpdating ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.trash className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 flex flex-col justify-start">
        <div className="flex flex-col p-2 pr-3 gap-2">
          {messages.length ? (
            <>
              {renderMessages()}
              {generationFiles.length > 0 && (
                <SiteGenerationProgress files={generationFiles} currentFile={currentFile} />
              )}
            </>
          ) : (
            <EmptyScreen
              projectType={project.projectType}
              onSendPrompt={prompt =>
                append({
                  id: nanoid(),
                  content: prompt,
                  role: 'user',
                  createdAt: new Date(),
                })
              }
            />
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-1">
        <div className="relative flex w-full border border-foreground/20 focus-within:border-foreground/50 rounded-lg overflow-hidden bg-background gap-2">
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
              'absolute right-1 bottom-1 rounded shrink-0 h-5 w-auto flex items-center gap-1 px-2 text-xs',
              isLoading && 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {isLoading ? 'stop' : 'submit'}
            {isLoading ? (
              <Icons.square className="h-2 w-2" />
            ) : (
              <Icons.cornerDownLeft className="h-2 w-2" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyScreen({
  projectType,
  onSendPrompt,
}: {
  projectType: 'site' | 'page';
  onSendPrompt: (prompt: string) => void;
}) {
  const samplePrompts =
    projectType === 'site'
      ? [
          'Create a multi-page site about a new product',
          'Build a pricing page with three tiers',
          'Design a hero section with a call-to-action',
        ]
      : [
          'Create a login form with a modern design',
          'Build a pricing page with three tiers',
          'Design a hero section with a call-to-action',
        ];

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mt-4 flex flex-col items-center space-y-2">
        <h2 className="font-medium">Sample prompts</h2>
        <div className="grid gap-2">
          {samplePrompts.map(prompt => (
            <Button
              key={prompt}
              variant="outline"
              className="h-auto p-1 text-left text-muted-foreground"
              onClick={() => onSendPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
