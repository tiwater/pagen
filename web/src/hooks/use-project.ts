import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useProjectStore from '@/store/project';
import { Project } from '@/types/project';
import { Message } from '@ai-sdk/react';

export function useProject(projectId?: string) {
  const { user } = useAuth();
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjects,
  } = useProjectStore();

  const project = projectId
    ? projects.find((p: Project) => p.id === projectId) : null;

  const createNewProject = useCallback(
    (title: string) => {
      if (!user?.id) throw new Error('User must be authenticated');
      const project = createProject(title, user.id);
      return project;
    },
    [user, createProject]
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateProject = useCallback(
    (projectId: string, update: Partial<Project>) => {
      setIsUpdating(true);
      updateProject(projectId, update);
      setIsUpdating(false);
    },
    [updateProject]
  );

  const appendMessage = useCallback(
    async (message: Message) => {
      if (!project) return;
      
      setIsUpdating(true);
      try {
        updateProject(project.id, {
          chat: {
            ...project.chat,
            messages: [...project.chat.messages, message],
          },
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [project, updateProject]
  );

  return {
    project,
    projects,
    createProject: createNewProject,
    updateProject: handleUpdateProject,
    appendMessage,
    isUpdating,
    deleteProject,
    getProjects,
  };
} 