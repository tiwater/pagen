'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';


interface CopyButtonProps {
  text: string;
  prompt?: string;
  className?: string;
}

export function CopyButton({ text, prompt, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({
      title: 'Copied',
      description: prompt
        ? prompt
        : 'The text has been copied to your clipboard. You can now paste it.',
      variant: 'default',
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <Button variant="ghost" size="icon" className={className} onClick={handleCopy}>
      {isCopied ? <Icons.check className="h-3 w-3" /> : <Icons.copy className="h-3 w-3" />}
    </Button>
  );
}