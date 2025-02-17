import { Icons } from './icons';

export function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Icons.simpleLogo className="w-9 h-9 animate-pulse text-muted-foreground/50" />
    </div>
  );
}
