"use client";

import { notFound } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { PreviewClient } from "./preview-client";

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { id } = use(params);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pages?id=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setContent(data.code);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [id]);

  if (error) {
    notFound();
  }

  try {
    if (!content) {
      return <div>Loading...</div>;
    }

    return <PreviewClient code={content} />;
  } catch (error) {
    console.error("Error rendering component:", error);
    return (
      <div>
        Error rendering component:{" "}
        {error instanceof Error ? error.message : "Unknown error occurred"}
      </div>
    );
  }
}
