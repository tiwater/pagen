"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";
import { transform } from "sucrase";
import { Loader2 } from "lucide-react";
import { install, tw } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";

// Initialize twind just for dynamic styles
install({
  presets: [presetTailwind()],
  hash: false,
});

export function PreviewClient({ code }: { code: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [Component, setComponent] = React.useState<React.ComponentType | null>(
    null
  );

  // Create a stable reference to our components
  const components = React.useMemo(
    () => ({
      React,
      Button,
      Card,
      CardHeader,
      CardContent,
      CardFooter,
      Input,
      Textarea,
      ...LucideIcons,
      tw, // Just for dynamic component's own styles
    }),
    []
  );

  React.useEffect(() => {
    try {
      console.log("Original code:", code);

      // Extract component name and definition
      const exportMatch = code.match(
        /export\s+(default\s+)?(?:function|const)\s+(\w+)/
      );
      if (!exportMatch) {
        throw new Error("No exported component found in the code");
      }
      const componentName = exportMatch[2];

      // Remove imports and exports
      const cleanCode = code
        .split("\n")
        .filter((line) => !line.trim().startsWith("import"))
        .join("\n")
        .replace(/export\s+default\s+/, "")
        .replace(/export\s+/, "")
        .trim();

      console.log("Clean code:", cleanCode);

      // Transform TSX to JS
      const { code: transformedCode } = transform(cleanCode, {
        transforms: ["typescript", "jsx"],
        production: true,
      });

      console.log("Transformed code:", transformedCode);

      // Create a function that will return our component
      const createComponent = new Function(
        ...Object.keys(components),
        `
        ${transformedCode}
        return ${componentName};
        `
      );

      // Create the component with all dependencies
      const PreviewComponent = createComponent(...Object.values(components));

      if (typeof PreviewComponent !== "function") {
        throw new Error("Failed to create component");
      }

      setComponent(() => PreviewComponent);
      setError(null);
    } catch (err) {
      console.error("Error creating component:", err);
      setError(err instanceof Error ? err.message : "Error creating component");
    }
  }, [code, components]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <pre className="whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background w-full">
        <Component />
      </div>
    );
  } catch (error) {
    console.error("Error rendering component:", error);
    return (
      <div className="p-4 text-red-500">
        <pre className="whitespace-pre-wrap">
          {error instanceof Error ? error.message : "Error rendering component"}
        </pre>
      </div>
    );
  }
}
