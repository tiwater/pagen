'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useChatStore from '@/store/chat';
import { nanoid } from 'nanoid';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AuthButton } from '@/components/auth-button';


const samplePrompts = [
  'Create a modern login page with social sign-in',
  'Design a pricing page with 3 tiers',
  'Build a contact form with a map',
  'Make a hero section for a SaaS product',
];

/**
 * The main entrypoint for the app, renders the homepage where users
 * can enter a prompt to generate a webpage.
 *
 * The component also renders a list of previous chats, allowing users
 * to easily go back to previous conversations.
 *
 * @returns The JSX element for the homepage.
 */
export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const createChat = useChatStore(state => state.createChat);
  const deleteChat = useChatStore(state => state.deleteChat);
  const chats = useChatStore(state => state.chats);

  const createNewChat = (promptText: string) => {
    if (!promptText.trim()) return;
    const chatId = createChat('New Webpage', 'default-user', `/chats/${nanoid(10)}`, promptText.trim());
    router.push(`/chat/${chatId}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createNewChat(prompt);
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

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const handleSamplePrompt = (e: React.MouseEvent, samplePrompt: string) => {
    e.preventDefault();
    createNewChat(samplePrompt);
  };

  const sortedChats = Object.values(chats).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-center">
          What can I help you build?
        </h1>
      </div>
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              name="prompt"
              placeholder="Describe the webpage you want to create..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[120px] resize-none text-xs sm:text-sm"
            />
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" variant="outline" className="h-7 gap-2">
                  <Icons.add className="w-4 h-4" />
                  <span className="text-xs">Rules</span>
                </Button>
                {/* <Button type="submit" size="sm" variant="outline" className="h-7 gap-2" >
                  <Icons.project className="w-4 h-4" />
                  <span className="text-xs">Projects</span>
                </Button> */}
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" className="h-7 gap-2" disabled={!prompt.trim()}>
                  <Icons.send className="w-4 h-4" />
                  <span className="text-xs">Send</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2 mt-2">
                {samplePrompts.map((samplePrompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => handleSamplePrompt(e, samplePrompt)}
                  >
                    {samplePrompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {sortedChats.length > 0 && (
        <div className="w-full mt-12 px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedChats.map(chat => (
              <Card
                key={chat.id}
                className="group cursor-pointer hover:shadow-md transition-colors relative"
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                >
                  <Icons.close className="h-3 w-3" />
                </Button>
                <CardHeader className="flex flex-row items-center gap-2 p-3 w-full">
                  <Icons.project className="w-4 h-4" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs line-clamp-3">
                    {chat.messages[0]?.content || 'No messages'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="absolute top-1 right-1">
        <AuthButton />
      </div>
    </main>
  );
}