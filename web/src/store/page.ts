import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PageBlock {
  path: string;
  content: string;
  styles?: string;
}

type Status = "idle" | "generating" | "complete" | "error";

interface PageState {
  // State
  page: PageBlock | null;
  pages: Record<string, PageBlock>;
  status: Status;
  error?: string;
  
  // Actions
  setPage: (page: PageBlock | null) => void;
  setStatus: (status: Status) => void;
  setError: (error?: string) => void;
  addPage: (pageId: string, page: PageBlock) => void;
}

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      // Initial State
      page: null,
      pages: {},
      status: "idle",
      error: undefined,

      // Synchronous Actions
      setPage: (page) => set({ page }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),
      addPage: (pageId, page) => set((state) => ({
        pages: {
          ...state.pages,
          [pageId]: page
        }
      }))
    }),
    {
      name: "page-storage",
      skipHydration: true,
    }
  )
);
