import { JobStatus } from '@/lib/types';
import { getStatusConfig } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobStatus | 'processing' | 'completed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        config.badgeBg,
        config.badgeText,
        className
      )}
    >
      {config.label}
    </span>
  );
}

