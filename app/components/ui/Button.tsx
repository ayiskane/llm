'use client';

import { forwardRef } from 'react';
import { cn, buttonClasses } from '@/lib/config/theme';

// Derive variant type from buttonClasses keys - single source of truth
type ButtonVariant = keyof typeof buttonClasses;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          buttonClasses[variant],
          size !== 'md' && sizeClasses[size],
          'inline-flex items-center justify-center gap-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

