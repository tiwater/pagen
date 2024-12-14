"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import useChatStore from "@/store/chat";

export function WebpageGenerator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const createChat = useChatStore((state) => state.createChat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const chatId = createChat("New Webpage", prompt);
    router.push(`/chat/${chatId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Describe the webpage you want to create..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <Button type="submit" className="w-full">
        <Icons.wand className="mr-2 h-4 w-4" />
        Generate Webpage
      </Button>
    </form>
  );
}
