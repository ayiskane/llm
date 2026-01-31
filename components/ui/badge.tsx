import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'uppercase rounded items-center justify-center border-transparent tracking-widest transition-colors',
  {
    variants: {
      variant: {
        default: 'text-[10px] font-medium bg-primary text-primary-foreground',
        // Court level badges
        provincial: 'badge-emerald',
        supreme: 'badge-purple',
        circuit: 'badge-amber',
        // Other semantic badges
        blue: 'badge-blue',
        rose: 'badge-rose',
        sky: 'badge-sky',
        indigo: 'badge-indigo',
        // Region badge (special styling)
        region: 'badge-slate text-[9px] font-mono leading-none inline-flex border border-[var(--border-default)]',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px] font-medium',
        md: 'px-2 py-1 text-[10px] font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  size = 'sm',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
