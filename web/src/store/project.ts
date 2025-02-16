import { Project } from '@/types/project';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  getProjects: () => Project[];
  createProject: (title: string, userId: string) => string;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  markProjectInitialized: (id: string) => void; 
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      getProjects: () => {
        const state = get();
        return Array.isArray(state.projects) ? state.projects : [];
      },

      createProject: (title, userId) => {
        const projectId = nanoid(10);
        set(state => ({
          currentProjectId: projectId,
          projects: [
            ...state.projects,
            {
              id: projectId,
              userId,
              title,
              isNew: false,
              chat: {
                id: nanoid(10),
                projectId,
                messages: [],
              },
              createdAt: new Date().toISOString(),
              pageTree: []  // Initialize with an empty page tree
            },
          ],
        }));
        return projectId;
      },

      updateProject: (id, project) =>
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? {
                  ...p,
                  ...project,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      deleteProject: (id) =>
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        })),

      setCurrentProject: (id) => set({ currentProjectId: id }),

      markProjectInitialized: (id) =>
        set(state => ({
          projects: state.projects.map(p => (p.id === id ? { ...p, isNew: false } : p)),
        })),
    }),
    {
      name: 'pages-project-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.projects)) {
          state.projects = state.projects.map(p => ({
            ...p,
            pageTree: p.pageTree ?? []
          }));
        } else if (state && !Array.isArray(state.projects)) {
          state.projects = [];
        }
      },
    }
  )
);

export default useProjectStore; 