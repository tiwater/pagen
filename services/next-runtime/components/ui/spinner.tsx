import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: 'default' | 'sm' | 'lg';
}

export function Spinner({ size = "default", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    default: "w-4 h-4",
    sm: "w-3 h-3",
    lg: "w-6 h-6",
  };

  return (
    <Loader2 
      className={cn(`animate-spin ${sizeClasses[size]}`, className)}
      {...props}
    />
  );
}