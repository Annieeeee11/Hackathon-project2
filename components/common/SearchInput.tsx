import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export function SearchInput({ 
  className, 
  containerClassName,
  placeholder = "Search...",
  ...props 
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent",
          "w-64",
          className
        )}
        {...props}
      />
    </div>
  );
}

