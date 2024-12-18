'use client'

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, Loader2 } from "lucide-react"
import { usePageStore } from '@/store/page'
import { useCallback } from 'react'
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Chat } from '@/types/chat'
import { cn } from "@/lib/utils"

interface ChatUIProps {
  id: string
  chat: Chat | null
}

interface PageBlock {
  path: string
  content: string
}

function PageBlock({ page }: { page: PageBlock }) {
  return (
    <div
      className={cn(
        "group cursor-pointer border border-input hover:border-input/80 rounded-md m-0.5 transition-colors"
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted text-muted-foreground group-hover:bg-muted/90 p-2">
        <Loader2 className="w-4 h-4" />
        <span className="font-medium">{page.path}</span>
      </div>
      <div className="text-xs font-mono bg-background group-hover:bg-background/90 text-muted-foreground overflow-hidden text-ellipsis p-2">
        {page.content}
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: any }) {
  const { pages } = usePageStore()
  return (
    <div className={cn("group relative mb-4 flex items-start md:mb-6", {
      "justify-end": message.role === "user"
    })}>
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        <div className={cn("flex items-center", {
          "justify-end": message.role === "user"
        })}>
          <div className="rounded-lg px-3 py-2 ring-1 ring-inset ring-gray-200">
            {message.content && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre({ node, ...props }) {
                    return (
                      <pre {...props} className="overflow-auto rounded-lg bg-muted p-4" />
                    )
                  },
                  code({ node, ...props }) {
                    return (
                      <code {...props} className="rounded bg-muted px-1 py-0.5" />
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            {message.pages && message.pages.length > 0 && (
              <div className="mt-4 space-y-2">
                {message.pages.map((page: string) => {
                  const pageData = pages[page]
                  if (!pageData) return null
                  return <PageBlock key={page} page={pageData} />
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyScreen({ setInput }: { setInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  const exampleMessages = [
    {
      heading: "Create a new React component",
      message: "Create a button component with hover and focus states"
    },
    {
      heading: "Add TypeScript types",
      message: "Add TypeScript types to my component"
    },
    {
      heading: "Fix a bug",
      message: "My component is not updating when props change"
    }
  ]

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Pagen AI
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          I can help you write, debug, and understand code.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-0 text-base"
              onClick={() => {
                const fakeEvent = {
                  target: { value: message.message },
                  preventDefault: () => {},
                } as React.ChangeEvent<HTMLTextAreaElement>
                setInput(fakeEvent)
              }}
            >
              <span className="text-xs">{message.heading}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChatUI({ id: chatId, chat }: ChatUIProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    id: chatId,
    body: {
      id: chatId,
    },
    onResponse(response) {
      if (response.status === 401) {
        // handle unauthorized
      }
    },
  })

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      handleSubmit(e)
    },
    [handleSubmit]
  )

  return (
    <div className="flex-1 space-y-4 pt-4 md:pt-6">
      <div className="space-y-4">
        {messages.length ? (
          messages.map((message, i) => (
            <ChatMessage key={message.id} message={message} />
          ))
        ) : (
          <EmptyScreen setInput={handleInputChange} />
        )}
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background">
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Send a message..."
            value={input}
            onChange={handleInputChange}
            rows={1}
            className="min-h-[52px] resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || input.trim().length === 0}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
