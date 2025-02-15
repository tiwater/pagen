import { Message } from 'ai';

export type ProjectType = 'page' | 'site';

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  type: 'page' | 'layout' | 'component';
  deleted?: boolean;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface Chat {
  id: string;
  userId: string;
  title?: string;
  messages: Message[];
  isNew?: boolean;
  projectType: ProjectType;
  files?: ProjectFile[];
  activeFileId?: string;
  createdAt: string;
  updatedAt?: string;
  latestCode?: string;
}
