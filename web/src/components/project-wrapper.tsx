'use client';

import { useEffect } from 'react';
import useProjectStore from '@/store/project';
import { Project } from '@/types/project';
import { PageLayout } from '@/components/page/page-layout';
import { SiteLayout } from '@/components/site/site-layout';

interface ProjectWrapperProps {
  project: Project;
}

export function ProjectWrapper({ project }: ProjectWrapperProps) {
  const { markProjectInitialized } = useProjectStore();

  useEffect(() => {
    if (!project.isNew && project.projectType) {
      markProjectInitialized(project.id);
    }
  }, [project.isNew, project.projectType, project.id, markProjectInitialized]);

  return project.projectType === 'site' ? (
    <SiteLayout project={project} />
  ) : (
    <PageLayout project={project} />
  );
}
