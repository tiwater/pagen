'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/hooks/use-project';
import { Icons } from '@/components/icons';
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
        } finally {
          setIsCreating(false);
        }
      }
    }

    handleProjectCreation();
  }, [project, createProject, router, isCreating]);

  if (!project || isCreating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.simpleLogo className="text-foreground/20 w-10 h-10 animate-pulse" />
        </div>
      </div>
    );
  }

  return <ProjectWrapper project={project} />;
}
