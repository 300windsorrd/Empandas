import * as React from 'react';
import { cn } from '../utils/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', disabled, ...props }, ref) => {
    const base = 'tfe-focus-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-[color:var(--color-brandRed)] text-white hover:brightness-95',
      secondary: 'bg-white text-black hover:bg-neutral-100',
      outline: 'border border-white/20 text-white hover:bg-white/10'
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} disabled={disabled} {...props} />
    );
  }
);
Button.displayName = 'Button';

