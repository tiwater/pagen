import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

interface Page {
  path: string;
  content: string;
  status: 'generating' | 'complete';
  messageId: string;
  metadata: {
    title: string;
    version?: string;
    description?: string;
  };
}

interface PageState {
  // State
  pages: Record<string, Page>;
  activePage: string | null;
  
  // Actions
  updatePage: (updates: Partial<Page> & Pick<Page, 'messageId'>) => void;
  setActivePage: (messageId: string) => void;
  getPagesByMessageId: (messageId: string) => Page[];
}

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      // Initial State
      pages: {},
      activePage: null,

      // Synchronous Actions
      getPagesByMessageId: (messageId) => {
        const state = get();
        return Object.values(state.pages).filter(page => page.messageId === messageId);
      },
      updatePage: (updates) => {
        set((state) => ({
          pages: {
            ...state.pages,
            [updates.messageId]: {
              ...state.pages[updates.messageId],
              ...updates,
              status: 'generating',
              metadata: {
                title: updates.metadata?.title || 'Generated Page',
              },
            },
          },
          activePage: state.activePage || updates.messageId
        }));
      },
      setActivePage: (messageId) =>
        set(() => ({
          activePage: messageId
        })),
    }),
    {
      name: "page-storage",
      skipHydration: true,
    }
  )
);
