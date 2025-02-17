'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useProject } from '@/hooks/use-project';
import { nanoid } from 'nanoid';
import { AuthButton } from '@/components/auth-button';
import { Icons } from '@/components/icons';
import { ProjectTypeSwitch } from '@/components/project-type-switch';
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
  const { projects, deleteProject } = useProject();
  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    deleteProject(projectId);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {projects.map(project => (
        <Link href={`/projects/${project.id}`} key={project.id} className="w-full">
          <Card className="relative group p-2 gap-2 flex items-center w-full h-full cursor-pointer hover:bg-accent">
            <Icons.folders className="w-4 h-4" />
            <span className="text-xs line-clamp-1">{project.title}</span>
            <div className="absolute right-1 hidden group-hover:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={e => handleDeleteProject(e, project.id)}
                className="p-0 w-6 h-6 hover:text-red-500 bg-accent"
              >
                <Icons.trash className="w-4 h-4" />
              </Button>
            </div>
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
  const [projectType, setProjectType] = useState<'page' | 'site'>('site');
  const { createProject, updateProject } = useProject();

  const handleCreateProject = (promptText: string) => {
    if (!promptText.trim() || !user?.id) return;

    // Create a new project with proper title from prompt
    const title = promptText.split('\n')[0].slice(0, 50) || 'New Project';
    const project = createProject(title);
    updateProject(project.id, {
      chat: {
        ...project.chat,
        messages: [
          {
            id: nanoid(10),
            role: 'user',
            content: promptText,
          },
        ],
      },
    });

    router.push(`/projects/${project.id}`);
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
    <main className="relative flex h-screen flex-col items-center p-8 md:p-24 mb-8 gap-8">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-center">
          What can I help you build?
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              name="prompt"
              placeholder={`Describe the ${projectType} you want to create...`}
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none text-xs sm:text-sm"
            />
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ProjectTypeSwitch value={projectType} onChange={setProjectType} />
                <Button disabled variant="outline" size="sm" className="h-7 gap-2">
                  <Icons.bot className="w-4 h-4" />
                  <span className="text-xs">gpt-4o</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" className="h-7 gap-2" disabled={!prompt.trim()}>
                  <span className="text-xs">submit</span>
                  <Icons.cornerDownLeft className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </form>
        <div className="text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2 mt-2">
            {samplePrompts[projectType].map((samplePrompt: string, index: number) => (
              <div
                key={index}
                className="text-xs px-2 py-1 rounded-md bg-accent/50 hover:bg-accent/80 cursor-pointer"
                onClick={e => handleSamplePrompt(e, samplePrompt)}
              >
                {samplePrompt}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProjectList />
      <div className="absolute top-1 right-1">
        <AuthButton />
      </div>
    </main>
  );
}
