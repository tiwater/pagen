import { Message } from 'ai';

export interface Chat {
  id: string;
  path: string;
  title: string;
  messages: Message[];
  logs: string[];
  isNew: boolean;
  createdAt: string;
  updatedAt?: string;
}
