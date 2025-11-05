import { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  icon: Icon,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1 w-6 h-6',
    md: 'p-1.5 w-8 h-8',
    lg: 'p-2 w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    default: 'hover:bg-zinc-200 text-zinc-600',
    danger: 'hover:bg-red-50 text-red-600',
    ghost: 'hover:bg-zinc-100 text-zinc-500',
  };

  return (
    <button
      className={cn(
        "rounded transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}

