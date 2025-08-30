import * as React from 'react';
import { cn } from '../utils/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'tfe-focus-ring w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm placeholder:text-white/50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

