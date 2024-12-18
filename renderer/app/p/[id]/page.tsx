import * as fs from "fs";
import * as path from "path";
import { PreviewClient } from "./preview-client";

async function getPreviewCode(id: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "app", "p", id, "page.tsx");
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const code = fs.readFileSync(filePath, "utf-8");
    // Extract the component code from the file (skip the imports and 'use client')
    const componentCode = code.split("${code}")[1];
    return componentCode;
  } catch (error) {
    console.error("Error reading preview code:", error);
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const code = await getPreviewCode(id);

  if (!code) {
    return <div className="p-4 text-red-500">Preview not found</div>;
  }

  return <PreviewClient code={code} />;
}
