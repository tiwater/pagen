'use client';

import { useEffect } from 'react';
import useChatStore from '@/store/chat';
import { Project } from '@/store/project';
import { PageLayout } from '@/components/page/page-layout';
import { SiteLayout } from '@/components/site/site-layout';

interface ProjectWrapperProps {
  project: Project;
}

export function ProjectWrapper({ project }: ProjectWrapperProps) {
  const { markChatInitialized } = useChatStore();

  useEffect(() => {
    if (!project.isNew && project.projectType) {
      markChatInitialized(project.id);
    }
  }, [project.isNew, project.projectType, project.id, markChatInitialized]);

  return project.projectType === 'site' ? (
    <SiteLayout project={project} />
  ) : (
    <PageLayout project={project} />
  );
}
