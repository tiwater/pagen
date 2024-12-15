'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useChatStore from "@/store/chat";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const createChat = useChatStore((state) => state.createChat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const chatId = createChat("New Webpage", prompt.trim());
    router.push(`/chat/${chatId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
        <h1 className="text-3xl font-semibold tracking-tight text-center">What can I help you build?</h1>
      </div>
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Describe the webpage you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none text-lg"
          />
          <Button 
            type="submit" 
            className="h-10 px-4" 
            disabled={!prompt.trim()}
          >
            <Icons.wand className="w-4 h-4 mr-2" />
            Generate Webpage
          </Button>
        </form>
      </div>
    </main>
  );
}
