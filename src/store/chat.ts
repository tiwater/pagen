import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from 'ai'
import { nanoid } from 'nanoid'

interface Chat {
  id: string
  title: string
  messages: Message[]
  generatedCode?: {
    files: Array<{
      path: string
      content: string
    }>
    lastUpdated: number
  }
  createdAt: number
  updatedAt: number
}

interface ChatState {
  chats: Record<string, Chat>
  currentChatId: string | null
  createChat: (title: string, initialMessage?: string) => string
  addMessage: (chatId: string, message: Message) => void
  updateGeneratedCode: (chatId: string, files: Array<{ path: string, content: string }>) => void
  setCurrentChat: (chatId: string) => void
}

// Type for the old state structure
interface OldChatState {
  messages: Record<string, Message[]>
  currentChatId: string | null
}

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,

      createChat: (title, initialMessage) => {
        const chatId = nanoid(10)
        set((state) => ({
          currentChatId: chatId,
          chats: {
            ...state.chats,
            [chatId]: {
              id: chatId,
              title,
              messages: initialMessage 
                ? [{ id: nanoid(10), role: 'user', content: initialMessage }]
                : [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
        }))
        return chatId
      },

      addMessage: (chatId, message) => 
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: Date.now()
              }
            }
          }
        }),

      updateGeneratedCode: (chatId, files) =>
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                generatedCode: {
                  files,
                  lastUpdated: Date.now()
                },
                updatedAt: Date.now()
              }
            }
          }
        }),

      setCurrentChat: (chatId) => 
        set({ currentChatId: chatId })
    }),
    {
      name: 'chat-store',
      version: 1,
    }
  )
)

export default useChatStore