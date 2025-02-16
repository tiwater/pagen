'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageTreeNode } from '@/types/project';
import { nanoid } from 'nanoid';
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
  files: PageTreeNode[];
  activeFileId?: string;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (path: string, type: 'page' | 'layout' | 'component') => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newPath: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children: TreeNode[];
  node?: PageTreeNode;
  layout?: PageTreeNode;
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

  // Build the file tree and attach layout files to their parent folder.
  const buildFileTree = (files: PageTreeNode[]): TreeNode[] => {
    const root: TreeNode = { name: '', path: '', type: 'folder', children: [] };

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      parts.forEach((part: string, i: number) => {
        const isLast = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        // If this is a layout file (layout.tsx) then bind it to the parent folder.
        if (
          isLast &&
          file.file?.name.endsWith('layout.tsx') &&
          part.toLowerCase() === 'layout.tsx'
        ) {
          current.layout = file;
          return;
        }

        // Standard folder or file node creation
        let node = current.children.find(n => n.name === part);
        if (!node) {
          node = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: [],
          };
          if (isLast) {
            node.node = file;
          }
          current.children.push(node);
        } else if (isLast && !node.node) {
          // If node already exists (by name) and this is the last segment, assign the file.
          node.node = file;
        }
        current = node;
      });
    });
    return root.children;
  };

  const tree = buildFileTree(files);

  // Add this helper function at the top level of the component
  const isFileNode = (node: TreeNode): node is TreeNode & { node: PageTreeNode } => {
    return node.type === 'file' && node.node !== undefined;
  };

  // Recursive component to render each tree node.
  const TreeNode = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const isLayoutActive = node.layout?.id === activeFileId;
    const isFileActive = node.node?.id === activeFileId;

    const handleFolderToggle = () => {
      setIsExpanded(prev => !prev);
    };

    return (
      <div style={{ paddingLeft: `${level * 12}px` }}>
        <div className="flex items-center gap-2">
          {node.type === 'folder' ? (
            <>
              <button
                onClick={handleFolderToggle}
                className={cn(
                  'flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-accent'
                )}
              >
                <Icons.chevronRight
                  className={cn(
                    'h-4 w-4 transform transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
                <Icons.folders className="h-4 w-4" />
                <span className="text-sm font-medium">{node.name}</span>
              </button>
              {node.layout && (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <button
                      onClick={() => onFileSelect(node.layout!.id)}
                      className={cn(
                        'p-1 rounded-md hover:bg-accent',
                        isLayoutActive && 'bg-accent'
                      )}
                      title="Open Layout"
                    >
                      <Icons.layout className="h-4 w-4" />
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onFileDelete(node.layout!.id)}>
                      Delete Layout
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => onFileRename(node.layout!.id, node.layout!.path)}
                    >
                      Rename Layout
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
            </>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger>
                <button
                  onClick={() => node.node && onFileSelect(node.node.id)}
                  className={cn(
                    'w-full text-left px-2 py-1 rounded-md hover:bg-accent flex items-center gap-2',
                    isFileActive && 'bg-accent'
                  )}
                >
                  {node.node?.file?.name.endsWith('page.tsx') ? (
                    <Icons.file className="h-4 w-4" />
                  ) : (
                    <Icons.layout className="h-4 w-4" />
                  )}
                  <span className="text-sm">{node.name}</span>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {isFileNode(node) && (
                  <>
                    <ContextMenuItem onClick={() => onFileDelete(node.node.id)}>
                      Delete
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onFileRename(node.node.id, node.node.path)}>
                      Rename
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>
        {node.type === 'folder' &&
          isExpanded &&
          node.children.map(child => <TreeNode key={child.path} node={child} level={level + 1} />)}
      </div>
    );
  };

  const handleFileCreate = (path: string, type: 'page' | 'layout' | 'component') => {
    const fileName = path.split('/').pop() || 'untitled';
    const newFile: PageTreeNode = {
      id: nanoid(),
      path,
      file: {
        id: nanoid(),
        name: `${fileName}.tsx`,
        content: '',
        metadata: {
          title: fileName,
        },
      },
    };

    onFileCreate(path, type);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span>Pages</span>
        </div>
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
                handleFileCreate(newFilePath, 'page');
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
            tree.map(node => <TreeNode key={node.path} node={node} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
