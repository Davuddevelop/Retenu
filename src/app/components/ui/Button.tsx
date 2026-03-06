// src/app/components/ui/Button.tsx
'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-[var(--foreground)] text-[var(--card)] hover:bg-gray-200 focus:ring-[var(--foreground)]',
      secondary:
        'bg-[var(--neutral-metric)] text-white hover:bg-[var(--neutral-metric)]/90 focus:ring-[var(--neutral-metric)]',
      outline:
        'border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-medium hover:bg-[var(--border)] focus:ring-[var(--border)]',
      ghost:
        'bg-transparent text-[var(--foreground)] font-medium hover:bg-[var(--card)] focus:ring-[var(--border)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
