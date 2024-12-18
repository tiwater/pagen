"use client";

import { useEffect, useState } from "react";
import { usePageStore } from "@/store/page";
import { Icons } from "./ui/icons";

const RENDERER_URL = "https://webrender.dustland.ai";

interface PagePreviewProps {
  messageId?: string;
}

export function PagePreview({ messageId }: PagePreviewProps) {
  const { pages } = usePageStore();
  const page = messageId ? pages[messageId] : null;
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function createPreviewPage() {
      if (!page?.content) return;

      try {
        const response = await fetch("/api/render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: messageId, code: page.content }),
        });

        if (!response.ok) {
          throw new Error("Failed to create preview page");
        }

        const data = await response.json();
        setPreviewUrl(`${RENDERER_URL}${data.url}`);
      } catch (error) {
        console.error("Failed to create preview:", error);
      } finally {
        setIsLoading(false);
      }
    }

    createPreviewPage();
  }, [messageId, page?.content]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load preview
      </div>
    );
  }

  return (
    <iframe
      src={previewUrl}
      className="h-full w-full"
      allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
    />
  );
}
