"use client";

import React from "react";
import * as UI from "@/components/ui";
import * as LucideIcons from "lucide-react";
import * as Recharts from "recharts";
import * as ts from "typescript";
import { install, tw } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";

// Initialize twind just for dynamic styles
install({
  presets: [presetTailwind()],
  hash: false,
  rules: [
    // Add custom class rules
    ["bg-card", { backgroundColor: "hsl(var(--card))" }],
    ["text-card-foreground", { color: "hsl(var(--card-foreground))" }],
    [
      "ring-offset-background",
      { "--tw-ring-offset-color": "hsl(var(--background))" },
    ],
    ["ring-ring", { "--tw-ring-color": "hsl(var(--ring))" }],
    // Recharts related classes
    ["recharts-wrapper", {}],
    ["recharts-surface", {}],
    ["recharts-layer", {}],
    ["recharts-responsive-container", {}],
    ["recharts-cartesian-grid", {}],
    ["recharts-cartesian-grid-horizontal", {}],
    ["recharts-cartesian-grid-vertical", {}],
    ["recharts-cartesian-axis", {}],
    ["recharts-xAxis", {}],
    ["xAxis", {}],
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
      ...UI,
      ...LucideIcons,
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
        if ((ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) && 
            node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
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
      const cleanCode = code_after_imports.replace(/export\s+(?:default\s+)?/, '');

      console.log("Clean code:", cleanCode);

      // Transform TSX to JS using TypeScript compiler
      const result = ts.transpileModule(cleanCode, {
        compilerOptions: {
          jsx: ts.JsxEmit.React,
          jsxFactory: 'React.createElement',
          jsxFragmentFactory: 'React.Fragment',
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
