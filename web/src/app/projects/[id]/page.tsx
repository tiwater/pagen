'use client';

import { use } from 'react';
import { useProject } from '@/hooks/use-project';
import { ProjectWrapper } from '@/components/project-wrapper';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const { projects, createProject } = useProject();
  const project = projects.find(p => p.id === id);

  if (!project) {
    // Create a new project with the given ID
    createProject('New Project', 'page');
    return null; // Will re-render with the new project
  }
  return <ProjectWrapper project={project} />;
}
