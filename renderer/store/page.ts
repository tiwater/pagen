import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PageStore {
  pages: Record<string, string>;
  getPage: (id: string) => string | undefined;
  setPage: (id: string, code: string) => void;
}

export const usePageStore = create<PageStore>()(
  persist(
    (set, get) => ({
      pages: {},
      getPage: (id) => get().pages[id],
      setPage: (id, code) => {
        set((state) => ({
          pages: { ...state.pages, [id]: code },
        }));
      },
    }),
    {
      name: "page-storage",
    }
  )
);
