'use client';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface FileStatus {
  path: string;
  type: 'page' | 'layout';
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

interface SiteGenerationProgressProps {
  files: FileStatus[];
  currentFile?: string;
}

export function SiteGenerationProgress({ files, currentFile }: SiteGenerationProgressProps) {
  return (
    <div className="space-y-2 p-2 border rounded-lg bg-muted/50">
      <h3 className="text-sm font-medium px-2">Generation Progress</h3>
      <div className="space-y-1">
        {files.map(file => (
          <div
            key={file.path}
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded-md text-xs',
              currentFile === file.path && 'bg-accent'
            )}
          >
            {file.type === 'layout' ? (
              <Icons.layout className="h-3 w-3 shrink-0" />
            ) : (
              <Icons.file className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate flex-1">{file.path}</span>
            {file.status === 'pending' && <Icons.clock className="h-3 w-3 text-muted-foreground" />}
            {file.status === 'generating' && <Icons.spinner className="h-3 w-3 animate-spin" />}
            {file.status === 'complete' && <Icons.check className="h-3 w-3 text-green-500" />}
            {file.status === 'error' && <Icons.alertCircle className="h-4 w-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}
