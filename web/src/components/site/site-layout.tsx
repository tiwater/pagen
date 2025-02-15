'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import useChatStore from '@/store/chat';
import { Project } from '@/store/project';
import { Chat, ProjectFile } from '@/types/chat';
import { Icons } from '@/components/icons';
import { CodeViewer } from '../code-viewer';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { FileTree } from './file-tree';
import { SiteChatPanel } from './site-chat-panel';

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
    <div className="grid grid-cols-[250px_1fr_300px] h-screen">
      <div className="border-r">
        <FileTree
          files={chat.files || []}
          activeFileId={chat.activeFileId}
          onFileSelect={fileId => setActiveFile(chat.id, fileId)}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
        />
      </div>

      <div className="flex flex-col">
        <div className="h-12 border-b px-4 flex items-center">
          <h3 className="font-semibold">{activeFile?.path || 'No file selected'}</h3>
        </div>
        <CodeViewer file={activeFile} />
      </div>

      <div className="border-l">
        <div className="h-12 border-b px-4 flex items-center">
          <h3 className="font-semibold">Chat</h3>
        </div>
        <SiteChatPanel chat={chat} />
      </div>

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
    </div>
  );
}
