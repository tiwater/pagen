import { ProjectType } from '@/types/chat';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  projectType: ProjectType;
  chatId?: string;
  createdAt: string;
  updatedAt?: string;
  isNew?: boolean;
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  getProjects: () => Project[];
  createProject: (title: string, userId: string, projectType?: ProjectType) => string;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
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

      createProject: (title, userId, projectType = 'page') => {
        const projectId = nanoid(10);
        set(state => ({
          currentProjectId: projectId,
          projects: [
            ...state.projects,
            {
              id: projectId,
              userId,
              title,
              projectType,
              isNew: true,
              createdAt: new Date().toISOString(),
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
    }),
    {
      name: 'project-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.projects)) {
          state.projects = [];
        }
      },
    }
  )
);

export default useProjectStore; 