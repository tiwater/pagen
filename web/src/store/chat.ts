import { Chat } from '@/types/chat';
import { Message } from 'ai';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  chats: Record<string, Chat>;
  currentChatId: string | null;
  createChat: (title: string, userId: string, path: string, initialMessage?: string) => string;
  addMessage: (chatId: string, message: Message) => void;
  addLog: (chatId: string, log: string) => void;
  setCurrentChat: (chatId: string) => void;
  markChatInitialized: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,

      createChat: (title, userId, path, initialMessage) => {
        const chatId = nanoid(10);
        console.log('Creating new chat:', chatId, 'with title:', title);
        set(state => ({
          currentChatId: chatId,
          chats: {
            ...state.chats,
            [chatId]: {
              id: chatId,
              userId,
              path,
              title,
              messages: initialMessage
                ? [
                    {
                      id: `msg-${nanoid(10)}`,
                      role: 'user',
                      content: initialMessage,
                      createdAt: new Date(),
                    },
                  ]
                : [],
              logs: [],
              isNew: true,
              createdAt: new Date().toISOString(),
              latestCode: '',
            },
          },
        }));
        console.log('Chat created:', chatId, 'Current store:', get().chats[chatId]);
        return chatId;
      },

      addMessage: (chatId, message) => {
        set(state => {
          const chat = state.chats[chatId];
          if (!chat) return state;

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addLog: (chatId, log) =>
        set(state => {
          const chat = state.chats[chatId];
          if (!chat) {
            console.warn('No chat found for ID:', chatId);
            return state;
          }
          console.log('Adding log:', log, 'to chat:', chatId, 'current logs:', chat.logs);
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                logs: [...(chat.logs || []), log],
              },
            },
          };
        }),

      markChatInitialized: chatId =>
        set(state => {
          const chat = state.chats[chatId];
          if (!chat) return state;

          console.log('Marking chat initialized:', chatId);
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                isNew: false,
              },
            },
          };
        }),

      setCurrentChat: (chatId: string) => set({ currentChatId: chatId }),

      deleteChat: chatId =>
        set(state => {
          const { [chatId]: deletedChat, ...remainingChats } = state.chats;
          return {
            chats: remainingChats,
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
          };
        }),
    }),
    {
      name: 'chat-store',
      version: 1,
    }
  )
);

export default useChatStore;
