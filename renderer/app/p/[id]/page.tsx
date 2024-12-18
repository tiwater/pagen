"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import * as React from "react";
import "./page.css";

// Import all the UI components that might be used in dynamic content
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        setContent(data.content);
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
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Input,
    Label,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  };

  try {
    // Create a React component function that returns the JSX
    const DynamicComponent = () => {
      const element = new Function(
        ...Object.keys(components),
        "React",
        `const {createElement: h} = React;
         return ${content}`
      )(...Object.values(components), React);

      return element;
    };

    return (
      <div className="preview-container">
        <DynamicComponent />
      </div>
    );
  } catch (e) {
    console.error("Error rendering component:", e);
    return <div className="error">Failed to render component</div>;
  }
}
