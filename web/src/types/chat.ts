import { Message } from 'ai';

export interface Chat {
  id: string;
  projectId: string;
  messages: Message[];
}
