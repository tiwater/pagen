// we do not support custom components yet
// so the files are only pages and layouts
// the page tree follows the App Router structure of Next.js 15.

import { Chat } from "./chat";

export type ProjectType = 'page' | 'site';

export interface ProjectFile {
  id: string;
  name: string; // relative to the project root, such as '/page.tsx' will be located at 'src/app/page.tsx' during generation
  content: string;
  // type is deduced from the file name, either 'page.tsx' or 'layout.tsx'
  deleted?: boolean;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface PageTreeNode {
  id: string;
  path: string;           // URL path: '/', '/about', '/blog/[slug]' etc.
  file?: ProjectFile;     // Optional file attached to this node
  children?: PageTreeNode[];
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  chat: Chat; // attached chat, maintains the chat history
  projectType: ProjectType;
  isNew?: boolean;
  createdAt: string;
  updatedAt?: string;
  pageTree: PageTreeNode[];
}
