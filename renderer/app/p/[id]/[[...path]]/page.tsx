import { getPage } from "@/lib/storage";
import { PreviewClient } from "./preview-client";

interface PageProps {
  params: Promise<{
    id: string;
    path?: string[];
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id, path = [] } = await params;
  const code = getPage(id);

  if (!code) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            The requested page does not exist.
          </p>
        </div>
      </div>
    );
  }

  return <PreviewClient code={code} />;
}
