'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useProject } from '@/hooks/use-project';
import useChatStore from '@/store/chat';
import { ProjectType } from '@/types/chat';
import { AuthButton } from '@/components/auth-button';
import { Icons } from '@/components/icons';
import { ProjectSelector } from '@/components/project-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const samplePrompts = {
  page: [
    'Create a modern login page with social sign-in',
    'Design a pricing page with 3 tiers',
    'Build a contact form with a map',
    'Make a hero section for a SaaS product',
  ],
  site: [
    'Create a multi-page website for a SaaS product',
    'Build a portfolio website for a developer',
    'Design a blog for a tech company',
    'Make a landing page for a new product',
  ],
};

function ProjectList() {
  const { projects } = useProject();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map(project => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <Card className="p-4 gap-2 flex items-center h-full cursor-pointer hover:bg-accent">
            {project.projectType === 'page' ? (
              <Icons.file className="w-4 h-4" />
            ) : (
              <Icons.folders className="w-4 h-4" />
            )}
            <span className="text-sm">{project.title}</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}

/**
 * The main entrypoint for the app, renders the homepage where users
 * can enter a prompt to generate a webpage.
 *
 * The component also renders a list of previous chats, allowing users
 * to easily go back to previous conversations.
 *
 * @returns The JSX element for the homepage.
 */
export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('page');
  const { createProject, updateProject, projects } = useProject();
  const { createChat } = useChatStore();

  const handleCreateProject = (promptText: string) => {
    if (!promptText.trim() || !user?.id) return;

    // Create a new project with proper title from prompt
    const title = promptText.split('\n')[0].slice(0, 50) || 'New Project';
    const projectId = createProject(title, projectType);

    // Create a chat and associate it with the project
    const chatId = createChat(title, user.id, promptText.trim());

    // Update project with chatId
    updateProject(projectId, { chatId });

    router.push(`/projects/${projectId}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCreateProject(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && prompt.trim()) {
        form.requestSubmit();
      }
    }
  };

  const handleSamplePrompt = (e: React.MouseEvent, samplePrompt: string) => {
    e.preventDefault();
    handleCreateProject(samplePrompt);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-8 md:p-24 gap-8">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-center">
          What can I help you build?
        </h1>
      </div>
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              name="prompt"
              placeholder="Describe the webpage you want to create..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none text-xs sm:text-sm"
            />
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ProjectSelector value={projectType} onChange={setProjectType} />
                <Button type="submit" size="sm" variant="outline" className="h-7 gap-2">
                  <Icons.add className="w-4 h-4" />
                  <span className="text-xs">Rules</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" className="h-7 gap-2" disabled={!prompt.trim()}>
                  <Icons.send className="w-4 h-4" />
                  <span className="text-xs">Send</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2 mt-2">
                {samplePrompts[projectType].map((samplePrompt: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={e => handleSamplePrompt(e, samplePrompt)}
                  >
                    {samplePrompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
      <ProjectList />
      <div className="absolute top-1 right-1">
        <AuthButton />
      </div>
    </main>
  );
}
