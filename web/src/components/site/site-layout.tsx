'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import useChatStore from '@/store/chat';
import { Project } from '@/store/project';
import { ProjectFile } from '@/types/chat';
import { ChatUI } from '@/components/chat-ui';
import { Icons } from '@/components/icons';
import { CodeViewer } from '../code-viewer';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { FileTree } from './file-tree';

interface SiteLayoutProps {
  project: Project;
}

export function SiteLayout({ project }: SiteLayoutProps) {
  const { updateChatFile, setActiveFile } = useChatStore();
  const chat = useChatStore(state =>
    project.chatId ? state.getChats().find(c => c.id === project.chatId) : null
  );

  const [fileToRename, setFileToRename] = useState<ProjectFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.warning className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No chat associated with this project</p>
        </div>
      </div>
    );
  }

  const activeFile = chat.files?.find(f => f.id === chat.activeFileId);

  const handleFileCreate = (path: string, type: 'page' | 'layout' | 'component') => {
    // ... existing file creation logic
  };

  const handleFileDelete = (fileId: string) => {
    const file = chat.files?.find(f => f.id === fileId);
    if (!file) return;
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;
    updateChatFile(chat.id, { ...fileToDelete, deleted: true });
    setFileToDelete(null);
    toast({ title: 'File deleted', description: `Deleted ${fileToDelete.path}` });
  };

  const handleFileRename = (fileId: string, currentPath: string) => {
    const file = chat.files?.find(f => f.id === fileId);
    if (!file) return;
    setFileToRename(file);
    setNewFileName(currentPath);
  };

  const confirmRename = () => {
    // ... existing rename logic
  };

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={15}>
          <FileTree
            files={chat.files || []}
            activeFileId={chat.activeFileId}
            onFileSelect={fileId => setActiveFile(chat.id, fileId)}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
          />
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel defaultSize={65}>
          <CodeViewer file={activeFile} />
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel defaultSize={20}>
          <ChatUI id={project.id} project={project} />
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
