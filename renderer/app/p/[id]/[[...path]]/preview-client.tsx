"use client";

import React from "react";
import * as UI from "@/components/ui";
import * as LucideIcons from "lucide-react";
import * as Recharts from "recharts";
import * as ts from "typescript";
import { install, tw } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import { Google, Facebook, GitHub } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

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
    ["bg-card", { backgroundColor: "hsl(var(--card))" }],
    ["text-card-foreground", { color: "hsl(var(--card-foreground))" }],
    [
      "ring-offset-background",
      { "--tw-ring-offset-color": "hsl(var(--background))" },
    ],
    ["border-border", { borderColor: "hsl(var(--border))" }],
    ["bg-background", { backgroundColor: "hsl(var(--background))" }],
    ["text-foreground", { color: "hsl(var(--foreground))" }],
    ["text-muted-foreground", { color: "hsl(var(--muted-foreground))" }],
    ["bg-primary", { backgroundColor: "hsl(var(--primary))" }],
    ["text-primary", { color: "hsl(var(--primary))" }],
    ["text-primary-foreground", { color: "hsl(var(--primary-foreground))" }],
    ["bg-secondary", { backgroundColor: "hsl(var(--secondary))" }],
    [
      "text-secondary-foreground",
      { color: "hsl(var(--secondary-foreground))" },
    ],
    ["bg-muted", { backgroundColor: "hsl(var(--muted))" }],
    ["bg-accent", { backgroundColor: "hsl(var(--accent))" }],
    ["text-accent-foreground", { color: "hsl(var(--accent-foreground))" }],
    ["bg-popover", { backgroundColor: "hsl(var(--popover))" }],
    ["text-popover-foreground", { color: "hsl(var(--popover-foreground))" }],
    ["bg-destructive", { backgroundColor: "hsl(var(--destructive))" }],
    [
      "text-destructive-foreground",
      { color: "hsl(var(--destructive-foreground))" },
    ],
    ["shadow-sm", { boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }],
    [
      "shadow",
      {
        boxShadow:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },
    ],
    [
      "shadow-md",
      {
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    ],
    [
      "shadow-lg",
      {
        boxShadow:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    ],
    ["rounded-lg", { borderRadius: "calc(var(--radius) + 0.25rem)" }],
    ["rounded-md", { borderRadius: "calc(var(--radius))" }],
    ["rounded-sm", { borderRadius: "calc(var(--radius) - 0.25rem)" }],
    ["p-4", { padding: "1rem" }],
  ],
});

interface PageTreeNode {
  id: string;
  path: string;
  file: {
    id: string;
    name: string;
    content: string;
    metadata: {
      title: string;
    };
  };
}

// Create a namespace for all UI components
const UIComponents = {
  // Shadcn UI components
  Button: UI.Button,
  Input: UI.Input,
  Card: UI.Card,
  CardHeader: UI.CardHeader,
  CardTitle: UI.CardTitle,
  CardDescription: UI.CardDescription,
  CardContent: UI.CardContent,
  CardFooter: UI.CardFooter,
  Dialog: UI.Dialog,
  DialogTrigger: UI.DialogTrigger,
  DialogContent: UI.DialogContent,
  DialogHeader: UI.DialogHeader,
  DialogFooter: UI.DialogFooter,
  DialogTitle: UI.DialogTitle,
  DialogDescription: UI.DialogDescription,
  Label: UI.Label,
  Tabs: UI.Tabs,
  TabsList: UI.TabsList,
  TabsTrigger: UI.TabsTrigger,
  TabsContent: UI.TabsContent,
  Select: UI.Select,
  SelectTrigger: UI.SelectTrigger,
  SelectValue: UI.SelectValue,
  SelectContent: UI.SelectContent,
  SelectItem: UI.SelectItem,
  Sheet: UI.Sheet,
  SheetTrigger: UI.SheetTrigger,
  SheetContent: UI.SheetContent,
  SheetHeader: UI.SheetHeader,
  SheetFooter: UI.SheetFooter,
  SheetTitle: UI.SheetTitle,
  SheetDescription: UI.SheetDescription,
  Avatar: UI.Avatar,
  AvatarImage: UI.AvatarImage,
  AvatarFallback: UI.AvatarFallback,
  Badge: UI.Badge,
  Progress: UI.Progress,
  Separator: UI.Separator,
  ScrollArea: UI.ScrollArea,
  Table: UI.Table,
  TableHeader: UI.TableHeader,
  TableBody: UI.TableBody,
  TableFooter: UI.TableFooter,
  TableHead: UI.TableHead,
  TableRow: UI.TableRow,
  TableCell: UI.TableCell,
  TableCaption: UI.TableCaption,
  Textarea: UI.Textarea,
  Toast: UI.Toast,
  Toaster: UI.Toaster,
  useToast,

  // Icons
  Icons: {
    ...LucideIcons,
    Google,
    Facebook,
    GitHub,
  },

  // Chart components
  Charts: Recharts,
};

export function PreviewClient({ code }: { code: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [Component, setComponent] = React.useState<React.ComponentType | null>(
    null
  );

  // Parse the pageTree from the code string
  const pageTree: PageTreeNode[] = React.useMemo(() => {
    try {
      return JSON.parse(code);
    } catch (e) {
      console.error("Failed to parse pageTree:", e);
      return [];
    }
  }, [code]);

  // Get the current URL path
  const pathname = window.location.pathname;
  const matches = pathname.match(/^\/p\/([^\/]+)(?:\/(.*))?$/);
  const projectId = matches?.[1] || "";
  const pagePath = matches?.[2] || "";

  // Create a temporary filesystem in memory
  React.useEffect(() => {
    let isMounted = true;

    async function setupPreview() {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        // Find the current page
        const currentPagePath = pagePath
          ? `app/${pagePath}/page.tsx`
          : "app/page.tsx";

        console.log("Looking for page:", currentPagePath);

        const currentPage = pageTree.find(
          (node) => node.path === currentPagePath
        );

        if (!currentPage) {
          throw new Error(
            `No page component found for path: ${currentPagePath}`
          );
        }

        // Find all relevant layouts
        const layoutPaths = ["app/layout.tsx"];
        if (pagePath) {
          const segments = pagePath.split("/");
          for (let i = 0; i < segments.length; i++) {
            layoutPaths.push(
              `app/${segments.slice(0, i + 1).join("/")}/layout.tsx`
            );
          }
        }

        console.log("Layout paths:", layoutPaths);

        // Get all layout components
        const layouts = layoutPaths
          .map((path) => pageTree.find((node) => node.path === path))
          .filter(Boolean);

        console.log(
          "Found layouts:",
          layouts.map((l) => l?.path)
        );

        // Compile all components
        const compiledComponents = new Map<string, React.ComponentType>();

        // First compile layouts from root to leaf
        for (const layout of layouts) {
          if (!layout) continue;
          try {
            const component = compileComponent(layout.file.content, {
              React,
              UI,
              LucideIcons,
              Recharts,
              tw,
            });
            compiledComponents.set(layout.path, component);
            console.log("Compiled layout:", layout.path);
          } catch (err) {
            console.error(`Error compiling layout ${layout.path}:`, err);
          }
        }

        // Then compile the page component
        try {
          const pageComponent = compileComponent(currentPage.file.content, {
            React,
            UI,
            LucideIcons,
            Recharts,
            tw,
          });
          compiledComponents.set(currentPage.path, pageComponent);
          console.log("Compiled page:", currentPage.path);
        } catch (err) {
          console.error(`Error compiling page ${currentPage.path}:`, err);
          throw err;
        }

        // Create the final component tree
        const App = () => {
          const Page = compiledComponents.get(currentPage.path);
          if (!Page) return null;

          let content = <Page />;

          // Apply layouts from innermost to outermost
          for (let i = layouts.length - 1; i >= 0; i--) {
            const layout = layouts[i];
            const Layout = layout ? compiledComponents.get(layout.path) : null;
            if (Layout) {
              content = React.createElement(Layout, null, content);
            }
          }

          return content;
        };

        if (isMounted) {
          setComponent(() => App);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error setting up preview:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Error setting up preview"
          );
          setIsLoading(false);
        }
      }
    }

    setupPreview();

    return () => {
      isMounted = false;
    };
  }, [pageTree, pagePath]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <pre className="whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-screen bg-background w-full">
        <p className="text-sm text-muted-foreground">No component to render</p>
      </div>
    );
  }

  try {
    return (
      <div className="preview-container flex items-start justify-center h-screen overflow-y-auto w-full bg-background">
        <div className="preview-content w-full h-full">
          <Component />
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

// Helper function to compile a component
function compileComponent(code: string, components: any) {
  // Parse the code using TypeScript's parser
  const sourceFile = ts.createSourceFile(
    "component.tsx",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // Find the last import declaration position
  let lastImportEnd = 0;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      lastImportEnd = Math.max(lastImportEnd, node.end);
    }
  });

  // Get everything after the imports
  let code_after_imports = code.slice(lastImportEnd).trim();

  // Find the component declaration
  const componentNode = ts.forEachChild(sourceFile, (node) => {
    if (
      (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
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

  // Add necessary imports at the top
  const preamble = `
    const { ${Object.keys(UIComponents).join(", ")} } = UI;
    
    interface Props {
      children?: React.ReactNode;
    }
  `;

  // Remove 'export default' or 'export' from the code
  const cleanCode = code_after_imports
    .replace(/export\s+(?:default\s+)?/, "")
    .replace(/function\s+(\w+)\s*\([^)]*\)/, (match, name) => {
      return `function ${name}({ children }: Props)`;
    });

  // Transform TSX to JS using TypeScript compiler
  const result = ts.transpileModule(`${preamble}\n${cleanCode}`, {
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

  // Create a function that will return our component
  const createComponent = new Function(
    "React",
    "UI",
    "tw",
    `
    ${transformedCode}
    return ${componentName};
    `
  );

  // Create the component with all dependencies
  return createComponent(React, UIComponents, tw);
}
