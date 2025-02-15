'use client';

import { useState } from 'react';
import { ProjectFile } from '@/types/chat';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId?: string;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (path: string, type: 'page' | 'layout' | 'component') => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newPath: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children: FileNode[];
  file?: ProjectFile;
}

export function FileTree({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileTreeProps) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  // Build tree structure
  const buildFileTree = (files: ProjectFile[]): FileNode[] => {
    const root: FileNode = { name: '', path: '', type: 'folder', children: [] };

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, i) => {
        const isLast = i === parts.length - 1;
        const path = parts.slice(0, i + 1).join('/');
        let node = current.children.find(n => n.name === part);

        if (!node) {
          node = {
            name: part,
            path,
            type: isLast ? 'file' : 'folder',
            children: [],
            file: isLast ? file : undefined,
          };
          current.children.push(node);
        }

        current = node;
      });
    });

    return root.children;
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isActive = node.file?.id === activeFileId;

    return (
      <div key={node.path} style={{ paddingLeft: `${level * 12}px` }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <button
              onClick={() => node.file && onFileSelect(node.file.id)}
              className={cn(
                'w-full text-left px-2 py-1 rounded-md hover:bg-accent flex items-center gap-2',
                isActive && 'bg-accent'
              )}
            >
              {node.type === 'folder' ? (
                <Icons.folders className="h-4 w-4" />
              ) : node.file?.type === 'page' ? (
                <Icons.file className="h-4 w-4" />
              ) : (
                <Icons.layout className="h-4 w-4" />
              )}
              <span className="text-sm">{node.name}</span>
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {node.type === 'file' && (
              <>
                <ContextMenuItem onClick={() => node.file && onFileDelete(node.file.id)}>
                  Delete
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => node.file && onFileRename(node.file.id, node.file.path)}
                >
                  Rename
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        {node.type === 'folder' && node.children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  const tree = buildFileTree(files);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold">Project Files</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreatingFile(true)}
          className="h-7 w-7 p-0"
        >
          <Icons.plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isCreatingFile ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                onFileCreate(newFilePath, 'page');
                setIsCreatingFile(false);
                setNewFilePath('');
              }}
              className="space-y-2"
            >
              <Input
                autoFocus
                value={newFilePath}
                onChange={e => setNewFilePath(e.target.value)}
                placeholder="app/new-page.tsx"
                className="h-7"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-7">
                  Create
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingFile(false)}
                  className="h-7"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            tree.map(node => renderNode(node))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
