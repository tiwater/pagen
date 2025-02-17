'use client';

import { ProjectType } from '@/types/project';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface ProjectTypeSwitchProps {
  value: ProjectType;
  onChange: (type: ProjectType) => void;
}

export function ProjectTypeSwitch({ value, onChange }: ProjectTypeSwitchProps) {
  return (
    <div className="relative flex items-center h-7 w-[125px] rounded-md border bg-muted p-0.5">
      <div
        className={cn(
          'absolute h-6 w-[60px] rounded-[5px] bg-background shadow-sm transition-transform duration-200 ease-in-out',
          value === 'site' && 'translate-x-[60px]'
        )}
      />
      <button
        className={cn(
          'relative flex h-6 w-[60px] items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium transition-colors',
          value === 'page' ? 'text-foreground' : 'text-muted-foreground'
        )}
        onClick={() => onChange('page')}
      >
        <Icons.file className="h-3 w-3" />
        <span>page</span>
      </button>
      <button
        className={cn(
          'relative flex h-6 w-[60px] items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium transition-colors',
          value === 'site' ? 'text-foreground' : 'text-muted-foreground'
        )}
        onClick={() => onChange('site')}
      >
        <Icons.folders className="h-3 w-3" />
        <span>site</span>
      </button>
    </div>
  );
}
