'use client'

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/ui/icons"
import { usePageStore } from '@/store/page'
import { useCallback } from 'react'
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Chat } from '@/types/chat'

interface ChatUIProps {
  id: string
  chat: Chat | null
}

interface PageBlock {
  path: string
  content: string
}

function PagePreview({ page }: { page: PageBlock }) {
  const { updatePage, setStatus } = usePageStore()

  const handleClick = () => {
    setStatus('complete')
    updatePage(page)
  }

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
  )
}

function ChatMessage({ message }: { message: any }) {
  if (message.role === "user") {
    return (
      <div className="flex w-max max-w-[80%] ml-auto bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm">
        {message.content}
      </div>
    )
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
            code: ({ inline, className, children, ...props }: any) => {
              const language = /language-(\w+)/.exec(className || '')?.[1]

              if (inline) {
                return (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                )
              }

              if (language === 'pagen') {
                try {
                  const page: PageBlock = {
                    path: 'app/page.tsx',
                    content: String(children).replace(/\n$/, '')
                  }
                  return <PagePreview page={page} />
                } catch (error) {
                  console.error('Failed to parse pagen block:', error)
                }
              }

              return (
                <pre className="not-prose bg-muted rounded-lg p-3 mb-4">
                  <code className="text-xs font-mono block whitespace-pre" {...props}>
                    {children}
                  </code>
                </pre>
              )
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

function EmptyScreen({ setInput }: { setInput: (input: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Pagen!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a web page generator powered by AI. Describe what kind of page you want to create and I'll help you build it.
        </p>
        <p className="leading-normal text-muted-foreground">
          Try an example:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          <Button
            variant="link"
            className="h-auto p-0 text-base"
            onClick={() => setInput("Create a landing page for a coffee shop with a hero section and menu")}
          >
            Create a landing page for a coffee shop with a hero section and menu →
          </Button>
          <Button
            variant="link"
            className="h-auto p-0 text-base"
            onClick={() => setInput("Build a simple todo list app with React")}
          >
            Build a simple todo list app with React →
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ChatUI({ id: chatId, chat }: ChatUIProps) {
  const { setOngoingCode, setStatus, saveGeneratedCode } = usePageStore()

  const chatWithDate = chat ? {
    ...chat,
    createdAt: new Date(chat.createdAt)
  } : null;

  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit: onSubmit, append } = useChat({
    api: "/api/generate",
    id: chatId,
    initialMessages: chatWithDate?.messages || [],
    onFinish: useCallback((message: any) => {
      // When generation is complete, extract code and save it
      const codeMatch = message.content.match(/\`\`\`pagen\n([\s\S]*?)\n\`\`\`/)
      if (codeMatch) {
        const extractedCode = codeMatch[1]
        saveGeneratedCode(chatId, extractedCode)
      }
    }, [chatId, saveGeneratedCode]),
    onResponse: useCallback((response: Response) => {
      setStatus('generating')
    }, [setStatus])
  })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')
    setOngoingCode('')
    return onSubmit(e)
  }, [onSubmit, setStatus, setOngoingCode])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length ? (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
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
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <Button type="submit" size="icon">
            <Icons.send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
