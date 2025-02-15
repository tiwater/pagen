'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useChatStore from '@/store/chat';
import { Project } from '@/store/project';
import { ProjectTypeSelector } from '@/components/project-type-selector';
import { PageLayout } from '@/components/project/page-layout';
import { SiteLayout } from '@/components/site/site-layout';

interface ProjectWrapperProps {
  project: Project;
}

export function ProjectWrapper({ project }: ProjectWrapperProps) {
  const router = useRouter();
  const { markChatInitialized, updateChatProjectType } = useChatStore();

  useEffect(() => {
    if (!project.isNew && project.projectType) {
      markChatInitialized(project.id);
    }
  }, [project.isNew, project.projectType, project.id, markChatInitialized]);

  // Show project type selector for new projects
  // if (project.isNew || !project.projectType) {
  //   return <ProjectTypeSelector onSelect={type => updateChatProjectType(project.id, type)} />;
  // }

  // Render appropriate layout based on project type
  return project.projectType === 'site' ? (
    <SiteLayout project={project} />
  ) : (
    <PageLayout project={project} />
  );
}
