'use client';

import { ProjectType } from '@/types/chat';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface ProjectSelectorProps {
  value: ProjectType;
  onChange: (type: ProjectType) => void;
}

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  return (
    <div className="relative flex h-7 w-[126px] rounded-md border bg-muted p-0.5">
      <div
        className={cn(
          'absolute h-6 w-[60px] rounded-[4px] bg-background shadow-sm transition-transform duration-200 ease-in-out',
          value === 'site' && 'translate-x-[60px]'
        )}
      />
      <button
        className={cn(
          'relative flex h-6 w-[60px] items-center justify-center gap-1.5 rounded-[4px] text-xs font-medium transition-colors',
          value === 'page' ? 'text-foreground' : 'text-muted-foreground'
        )}
        onClick={() => onChange('page')}
      >
        <Icons.file className="h-3 w-3" />
        <span>Page</span>
      </button>
      <button
        className={cn(
          'relative flex h-6 w-[60px] items-center justify-center gap-1.5 rounded-[4px] text-xs font-medium transition-colors',
          value === 'site' ? 'text-foreground' : 'text-muted-foreground'
        )}
        onClick={() => onChange('site')}
      >
        <Icons.folders className="h-3 w-3" />
        <span>Site</span>
      </button>
    </div>
  );
}
