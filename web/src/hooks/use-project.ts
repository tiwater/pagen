import { useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useChatStore from '@/store/chat';
import useProjectStore, { Project } from '@/store/project';
import { ProjectType } from '@/types/chat';

export function useProject(projectId?: string) {
  const { user } = useAuth();
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProjects,
    currentProjectId,
    setCurrentProject,
  } = useProjectStore();
  const { createChat } = useChatStore();

  const project = projectId
    ? projects.find((p: Project) => p.id === projectId)
    : projects.find((p: Project) => p.id === currentProjectId);

  const createNewProject = useCallback(
    (title: string, projectType: ProjectType = 'page') => {
      if (!user?.id) throw new Error('User must be authenticated');

      const projectId = createProject(title, user.id, projectType);
      const chatId = createChat(title, user.id);
      
      updateProject(projectId, { chatId });
      setCurrentProject(projectId);
      
      return projectId;
    },
    [user, createProject, createChat, updateProject, setCurrentProject]
  );

  return {
    project,
    projects,
    createProject: createNewProject,
    updateProject,
    deleteProject,
    getProjects,
    currentProjectId,
    setCurrentProject,
  };
} 