import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="w-4 h-4 animate-spin" />
    </div>
  );
}
