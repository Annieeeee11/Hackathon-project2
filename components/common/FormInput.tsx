import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent",
            "transition-colors",
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-zinc-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

