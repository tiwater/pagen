'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/hooks/use-project';
import { toast } from '@/hooks/use-toast';
import { PageTreeNode } from '@/types/project';
import { nanoid } from 'nanoid';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '@/components/code-workspace';
import { Icons } from '@/components/icons';
import { FileTree } from '@/components/page-tree';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, createProject, updateProject } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const project = projects.find(p => p.id === id);
  const [fileToRename, setFileToRename] = useState<PageTreeNode | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<PageTreeNode | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const activeFile = project?.pageTree?.find(f => f.id === activeFileId);

  const handleFileCreate = (path: string, type: 'page' | 'layout' | 'component') => {
    if (!project) return;
    const newFile: PageTreeNode = {
      id: nanoid(),
      path,
      file: {
        id: nanoid(),
        name: path.split('/').pop() || 'Untitled',
        content: '',
        metadata: {
          title: path.split('/').pop() || 'Untitled',
        },
      },
    };

    updateProject(project.id, {
      pageTree: [...(project.pageTree || []), newFile],
    });
  };

  const handleFileDelete = (fileId: string) => {
    const file = project?.pageTree?.find(f => f.id === fileId);
    if (!file) return;
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (!fileToDelete || !project) return;
    updateProject(project.id, {
      pageTree: project.pageTree?.filter(f => f.id !== fileToDelete.id),
    });
    setFileToDelete(null);
    toast({ title: 'File deleted', description: `Deleted ${fileToDelete.path}` });
  };

  const handleFileRename = (fileId: string, currentPath: string) => {
    const file = project?.pageTree?.find(f => f.id === fileId);
    if (!file) return;
    setFileToRename(file);
    setNewFileName(currentPath);
  };

  const confirmRename = () => {
    if (!fileToRename || !newFileName.trim() || !project) return;
    updateProject(project.id, {
      pageTree: project.pageTree?.map(f =>
        f.id === fileToRename.id ? { ...f, path: newFileName.trim() } : f
      ),
    });
    setFileToRename(null);
    setNewFileName('');
    toast({ title: 'File renamed', description: `Renamed to ${newFileName}` });
  };

  const handleDeleteAllFiles = () => {
    if (!project) return;
    updateProject(project.id, {
      pageTree: [],
    });
    setActiveFileId(null);
  };

  if (!project || isCreating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.simpleLogo className="text-foreground/20 w-10 h-10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30}>
          <ChatUI project={project} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={55}>
          <CodeWorkspace file={activeFile?.file} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={15} className="flex flex-col h-full">
          <FileTree
            files={project.pageTree || []}
            activeFileId={activeFileId || undefined}
            onFileSelect={setActiveFileId}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onDeleteAllFiles={handleDeleteAllFiles}
          />
        </ResizablePanel>

        {/* Rename Dialog */}
        <Dialog open={!!fileToRename} onOpenChange={() => setFileToRename(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
            </DialogHeader>
            <Input
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="app/new-name.tsx"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFileToRename(null)}>
                Cancel
              </Button>
              <Button onClick={confirmRename}>Rename</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {fileToDelete?.path}?</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFileToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ResizablePanelGroup>
    </div>
  );
}
