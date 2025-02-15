'use client';

import { ProjectType } from '@/types/chat';

interface ProjectTypeSelectorProps {
  onSelect: (type: ProjectType) => void;
}

export function ProjectTypeSelector({ onSelect }: ProjectTypeSelectorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Choose Project Type</h1>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('page')}
            className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent"
          >
            <span>Single Page</span>
            <p className="text-sm text-muted-foreground">Create a standalone page component</p>
          </button>
          <button
            onClick={() => onSelect('site')}
            className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent"
          >
            <span>Full Site</span>
            <p className="text-sm text-muted-foreground">
              Create a multi-page website with shared layout
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
