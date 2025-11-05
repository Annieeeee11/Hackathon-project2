import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <Icon className="w-12 h-12 text-zinc-300 mb-3" />
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      {description && (
        <p className="text-xs text-zinc-400 mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

