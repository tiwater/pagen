"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";
import { transform } from "sucrase";

export function PreviewClient({ code }: { code: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [Component, setComponent] = React.useState<React.ComponentType | null>(
    null
  );

  React.useEffect(() => {
    try {
      // Make all components available in the scope
      const components = {
        React,
        Button,
        Card,
        CardHeader,
        CardContent,
        CardFooter,
        Input,
        ...LucideIcons,
      };

      // Remove imports and exports, keeping the component definition
      const cleanCode = code
        .replace(/import[\s\S]*?from\s+['"].*?['"];?/g, "")
        .replace(/export\s+default\s+/, "")
        .replace(/import\s*{[\s\S]*?}\s*from\s*['"].*?['"];?/g, "")
        .trim();

      // Transform TSX to JS using Sucrase
      const { code: transformedCode } = transform(cleanCode, {
        transforms: ["typescript", "jsx"],
        production: true,
      });

      const functionBody = `
        with (components) {
          return ${transformedCode};
        }
      `;

      const ComponentFunction = new Function("components", functionBody);
      const PreviewComponent = ComponentFunction(components);
      setComponent(() => PreviewComponent);
    } catch (error) {
      console.error("Error rendering preview:", error);
      setError(
        error instanceof Error ? error.message : "Error rendering preview"
      );
    }
  }, [code]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!Component) {
    return <div className="p-4">Loading...</div>;
  }

  try {
    return <Component />;
  } catch (error) {
    console.error("Error rendering component:", error);
    return <div className="p-4 text-red-500">Error rendering component</div>;
  }
}
