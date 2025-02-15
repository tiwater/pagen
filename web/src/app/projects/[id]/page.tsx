'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/hooks/use-project';
import { ProjectWrapper } from '@/components/project-wrapper';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, createProject } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    async function handleProjectCreation() {
      if (!project && !isCreating) {
        setIsCreating(true);
        try {
          await createProject('New Project', 'page');
          router.refresh();
        } catch (error) {
          console.error('Failed to create project:', error);
          router.push('/');
        }
        setIsCreating(false);
      }
    }

    handleProjectCreation();
  }, [project, createProject, router, isCreating]);

  if (!project || isCreating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return <ProjectWrapper project={project} />;
}
