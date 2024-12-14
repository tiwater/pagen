"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { useChatStore } from "@/lib/store";

export function WebpageGenerator() {
  const router = useRouter();
  const initializeChat = useChatStore((state) => state.initializeChat);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    const chatId = Math.random().toString(36).substring(7);
    initializeChat(chatId, prompt);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="grid gap-4 w-full">
      <div className="relative">
        <div className="flex items-center gap-2 absolute left-3 top-3">
          <Icons.link className="h-4 w-4 text-muted-foreground" />
          <Icons.figma className="h-4 w-4 text-muted-foreground" />
        </div>
        <Textarea
          className="min-h-[100px] pl-20 pr-20 py-4 resize-none"
          placeholder="a beautiful login page"
          onChange={(e) => {
            if (e.target.value.trim()) {
              handleGenerate(e.target.value);
            }
          }}
        />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {}}
          >
            <Icons.plus className="h-4 w-4" />
            <span className="sr-only">Add Project</span>
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" className="text-sm" onClick={() => handleGenerate("Generate a SaaS pricing calculator")}>
          Generate a SaaS pricing calculator →
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => handleGenerate("How can I schedule cron jobs?")}>
          How can I schedule cron jobs? →
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => handleGenerate("A function to flatten nested arrays")}>
          A function to flatten nested arrays →
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8 border rounded-lg">
          <Icons.spinner className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}
