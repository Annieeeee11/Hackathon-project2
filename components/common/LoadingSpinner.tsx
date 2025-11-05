import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-zinc-400")} />
      {text && <p className="text-sm text-zinc-500 mt-2">{text}</p>}
    </div>
  );
}

