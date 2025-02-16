import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useProjectStore from '@/store/project';
import { Project, ProjectType } from '@/types/project';

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

  const project = projectId
    ? projects.find((p: Project) => p.id === projectId)
    : projects.find((p: Project) => p.id === currentProjectId);

  const createNewProject = useCallback(
    (title: string, projectType: ProjectType = 'page') => {
      if (!user?.id) throw new Error('User must be authenticated');

      const projectId = createProject(title, user.id, projectType);
      
      setCurrentProject(projectId);
      
      return projectId;
    },
    [user, createProject, setCurrentProject]
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

  return {
    project,
    projects,
    createProject: createNewProject,
    updateProject: handleUpdateProject,
    isUpdating,
    deleteProject,
    getProjects,
    currentProjectId,
    setCurrentProject,
  };
} 