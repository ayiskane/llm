'use client';

import { forwardRef } from 'react';
import { cn, surface, text, border } from '@/lib/config/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, onClear, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className={cn("absolute left-3", text.hint)}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg',
            surface.control, border.visible,
            text.body, 'placeholder:text-slate-500',
            border.focus,
            'transition-all duration-200',
            icon ? 'pl-10' : 'pl-4',
            onClear ? 'pr-10' : 'pr-4',
            'py-2',
            className
          )}
          {...props}
        />
        {onClear && props.value && (
          <button
            type="button"
            onClick={onClear}
            className={cn("absolute right-3 transition-colors", text.hint, "hover:text-slate-200")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
