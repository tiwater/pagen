// components/ui/text.tsx
import React from 'react';
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'large';
}

export function Text({ className, variant = 'default', ...props }: TextProps) {
  const variantClasses = {
    default: 'text-sm font-medium leading-none',
    muted: 'text-sm text-muted-foreground',
    large: 'text-lg font-semibold',
  };

  return (
    <p 
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}