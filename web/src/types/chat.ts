import { Message } from 'ai';

export interface Chat {
  projectId: string;
  messages: Message[];
  model?: string;
}
