"use client";

import { notFound } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  if (!content) {
    return null;
  }

  // Create a component with all the required dependencies in scope
  const components = {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    Input,
    React,
  };

  try {
    // Evaluate the code in the context of available components
    const code = `
      ${content}
      const Page = ${
        content.includes("export default") ? content : `() => {${content}}`
      };
      return React.createElement(Page);
    `;

    // eslint-disable-next-line no-new-func
    const Component = new Function(...Object.keys(components), code);
    return Component(...Object.values(components));
  } catch (error) {
    console.error("Error rendering component:", error);
    return <div>Error rendering component</div>;
  }
}
