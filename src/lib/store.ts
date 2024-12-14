import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Message {
  role: "assistant" | "user"
  content: string
}

interface ChatState {
  messages: Record<string, Message[]>
  currentChatId: string | null
  addMessage: (chatId: string, message: Message) => void
  setCurrentChatId: (chatId: string) => void
  initializeChat: (chatId: string, initialMessage?: string) => void
}

// Create store with proper type checking
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: {},
      currentChatId: null,
      addMessage: (chatId, message) => 
        set((state) => {
          // Create new messages array to ensure reference change
          const chatMessages = [...(state.messages[chatId] || []), message]
          return {
            messages: {
              ...state.messages,
              [chatId]: chatMessages
            }
          }
        }),
      setCurrentChatId: (chatId) => 
        set({ currentChatId: chatId }),
      initializeChat: (chatId, initialMessage) => 
        set((state) => ({
          currentChatId: chatId,
          messages: {
            ...state.messages,
            [chatId]: initialMessage 
              ? [{ role: "user", content: initialMessage }] 
              : []
          }
        }))
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true // Important for Next.js
    }
  )
)
