import { getConfidenceColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const colors = getConfidenceColor(confidence);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      {confidence}%
    </span>
  );
}

