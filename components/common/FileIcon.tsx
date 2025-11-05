import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FileIcon({ className, size = 'md' }: FileIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn(
      sizeClasses[size],
      "bg-zinc-100 rounded-lg flex items-center justify-center shrink-0",
      className
    )}>
      <FileText className={cn(iconSizes[size], "text-zinc-600")} />
    </div>
  );
}

