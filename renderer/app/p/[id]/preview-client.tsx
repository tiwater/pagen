"use client";

import React from "react";
import * as UI from "@/components/ui";
import * as LucideIcons from "lucide-react";
import * as Recharts from "recharts";
import * as ts from "typescript";
import { install, tw } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import { Google, Facebook, GitHub } from "@/components/icons";

// Add base styles for Shadcn UI
const shadcnBaseStyles = `
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 0 0% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 0 0% 3.9%;
      --primary: 0 0% 9%;
      --primary-foreground: 0 0% 98%;
      --secondary: 0 0% 96.1%;
      --secondary-foreground: 0 0% 9%;
      --muted: 0 0% 96.1%;
      --muted-foreground: 0 0% 45.1%;
      --accent: 0 0% 96.1%;
      --accent-foreground: 0 0% 9%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 0 0% 89.8%;
      --input: 0 0% 89.8%;
      --ring: 0 0% 3.9%;
      --radius: 0.5rem;
    }
  
    .dark {
      --background: 0 0% 3.9%;
      --foreground: 0 0% 98%;
      --card: 0 0% 3.9%;
      --card-foreground: 0 0% 98%;
      --popover: 0 0% 3.9%;
      --popover-foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --primary-foreground: 0 0% 9%;
      --secondary: 0 0% 14.9%;
      --secondary-foreground: 0 0% 98%;
      --muted: 0 0% 14.9%;
      --muted-foreground: 0 0% 63.9%;
      --accent: 0 0% 14.9%;
      --accent-foreground: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;
      --border: 0 0% 14.9%;
      --input: 0 0% 14.9%;
      --ring: 0 0% 83.1%;
    }
  }

  @layer base {
    * {
      border-color: hsl(var(--border));
    }
    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Initialize twind with Shadcn UI compatible configuration
install({
  presets: [presetTailwind()],
  hash: false,
  rules: [
    // Add custom class rules
    ['bg-card', { backgroundColor: 'hsl(var(--card))' }],
    ['text-card-foreground', { color: 'hsl(var(--card-foreground))' }],
    ['ring-offset-background', { '--tw-ring-offset-color': 'hsl(var(--background))' }],
    ['border-border', { borderColor: 'hsl(var(--border))' }],
    ['bg-background', { backgroundColor: 'hsl(var(--background))' }],
    ['text-foreground', { color: 'hsl(var(--foreground))' }],
    ['text-muted-foreground', { color: 'hsl(var(--muted-foreground))' }],
    ['bg-primary', { backgroundColor: 'hsl(var(--primary))' }],
    ['text-primary', { color: 'hsl(var(--primary))' }],
    ['text-primary-foreground', { color: 'hsl(var(--primary-foreground))' }],
    ['bg-secondary', { backgroundColor: 'hsl(var(--secondary))' }],
    ['text-secondary-foreground', { color: 'hsl(var(--secondary-foreground))' }],
    ['bg-muted', { backgroundColor: 'hsl(var(--muted))' }],
    ['bg-accent', { backgroundColor: 'hsl(var(--accent))' }],
    ['text-accent-foreground', { color: 'hsl(var(--accent-foreground))' }],
    ['bg-popover', { backgroundColor: 'hsl(var(--popover))' }],
    ['text-popover-foreground', { color: 'hsl(var(--popover-foreground))' }],
    ['bg-destructive', { backgroundColor: 'hsl(var(--destructive))' }],
    ['text-destructive-foreground', { color: 'hsl(var(--destructive-foreground))' }],
    ['shadow-sm', { boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }],
    ['shadow', { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }],
    ['shadow-md', { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }],
    ['shadow-lg', { boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }],
    ['rounded-lg', { borderRadius: 'calc(var(--radius) + 0.25rem)' }],
    ['rounded-md', { borderRadius: 'calc(var(--radius))' }],
    ['rounded-sm', { borderRadius: 'calc(var(--radius) - 0.25rem)' }],
    ['p-4', { padding: '1rem' }],
  ],
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
      useState: React.useState,
      useEffect: React.useEffect,
      useMemo: React.useMemo,
      ...UI,
      ...LucideIcons,
      Google,
      Facebook,
      GitHub,
      ...Recharts, // Make all Recharts components available
      tw, // Just for dynamic component's own styles
    }),
    []
  );

  React.useEffect(() => {
    try {
      console.log("Original code:", code);

      // Parse the code using TypeScript's parser
      const sourceFile = ts.createSourceFile(
        "component.tsx",
        code,
        ts.ScriptTarget.Latest,
        true
      );

      // Find the last import declaration position
      let lastImportEnd = 0;

      ts.forEachChild(sourceFile, node => {
        if (ts.isImportDeclaration(node)) {
          lastImportEnd = Math.max(lastImportEnd, node.end);
        }
      });

      // Get everything after the imports
      let code_after_imports = code.slice(lastImportEnd).trim();

      // Find the component declaration
      const componentNode = ts.forEachChild(sourceFile, node => {
        if (
          (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) &&
          node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          return node;
        }
      });

      if (!componentNode) {
        throw new Error("No exported component found in the code");
      }

      // Get the component name
      let componentName: string;
      if (ts.isFunctionDeclaration(componentNode) && componentNode.name) {
        componentName = componentNode.name.text;
      } else if (ts.isVariableStatement(componentNode)) {
        const declaration = componentNode.declarationList.declarations[0];
        if (ts.isIdentifier(declaration.name)) {
          componentName = declaration.name.text;
        } else {
          throw new Error("Could not determine component name");
        }
      } else {
        throw new Error("Could not determine component name");
      }

      // Remove 'export default' or 'export' from the code
      const cleanCode = code_after_imports.replace(/export\s+(?:default\s+)?/, "");

      console.log("Clean code:", cleanCode);

      // Transform TSX to JS using TypeScript compiler
      const result = ts.transpileModule(cleanCode, {
        compilerOptions: {
          jsx: ts.JsxEmit.React,
          jsxFactory: "React.createElement",
          jsxFragmentFactory: "React.Fragment",
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          esModuleInterop: true,
          allowJs: true,
          allowSyntheticDefaultImports: true,
        },
      });

      const transformedCode = result.outputText;
      console.log("Transformed code:", transformedCode);

      // Create a function that will return our component
      const createComponent = new Function(
        ...Object.keys(components),
        `
        // Inject Shadcn UI base styles
        const style = document.createElement('style');
        style.textContent = ${JSON.stringify(shadcnBaseStyles)};
        document.head.appendChild(style);
        
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
      <div className="flex items-center justify-center h-screen bg-background w-full">
        <div className="flex flex-col items-center gap-4">
          <LucideIcons.Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="preview-container flex items-start justify-center h-screen overflow-y-auto w-full bg-background">
        <div className="preview-content w-full h-full">
          <main className="h-full">
            <Component />
          </main>
        </div>
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
