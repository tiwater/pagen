'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import useProjectStore from '@/store/project';
import { PageTreeNode, Project } from '@/types/project';
import { nanoid } from 'nanoid';
import { ChatUI } from '@/components/chat-ui';
import { CodeWorkspace } from '../code-workspace';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { FileTree } from './page-tree';

interface SiteLayoutProps {
  project: Project;
}

export function SiteLayout({ project }: SiteLayoutProps) {
  const { updateProject } = useProjectStore();
  const [fileToRename, setFileToRename] = useState<PageTreeNode | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<PageTreeNode | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const activeFile = project.pageTree?.find(f => f.id === activeFileId);

  const handleFileCreate = (path: string, type: 'page' | 'layout' | 'component') => {
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
    const file = project.pageTree?.find(f => f.id === fileId);
    if (!file) return;
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;
    updateProject(project.id, {
      pageTree: project.pageTree?.filter(f => f.id !== fileToDelete.id),
    });
    setFileToDelete(null);
    toast({ title: 'File deleted', description: `Deleted ${fileToDelete.path}` });
  };

  const handleFileRename = (fileId: string, currentPath: string) => {
    const file = project.pageTree?.find(f => f.id === fileId);
    if (!file) return;
    setFileToRename(file);
    setNewFileName(currentPath);
  };

  const confirmRename = () => {
    if (!fileToRename || !newFileName.trim()) return;
    updateProject(project.id, {
      pageTree: project.pageTree?.map(f =>
        f.id === fileToRename.id ? { ...f, path: newFileName.trim() } : f
      ),
    });
    setFileToRename(null);
    setNewFileName('');
    toast({ title: 'File renamed', description: `Renamed to ${newFileName}` });
  };

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
