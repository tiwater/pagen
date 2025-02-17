import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface ShellProps extends PropsWithChildren {
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return <div className={cn('grid items-start gap-8 pb-8 pt-6', className)}>{children}</div>;
}
