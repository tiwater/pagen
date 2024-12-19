'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useChatStore from '@/store/chat';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const createChat = useChatStore(state => state.createChat);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const prompt = (e.target as HTMLFormElement).prompt.value;
    if (!prompt.trim()) return;

    const chatId = createChat('New Webpage', 'default-user', `/chats/${nanoid(10)}`, prompt.trim());
    router.push(`/chat/${chatId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && prompt.trim()) {
        form.requestSubmit();
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          What can I help you build?
        </h1>
      </div>
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            name="prompt"
            placeholder="Describe the webpage you want to create..."
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none text-lg"
          />
          <Button type="submit" className="h-10 px-4" disabled={!prompt.trim()}>
            <Icons.wand className="w-4 h-4 mr-2" />
            Generate Webpage
          </Button>
        </form>
      </div>
    </main>
  );
}
