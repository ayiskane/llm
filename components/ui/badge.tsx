import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded border-transparent font-mono text-[9px] leading-none tracking-widest transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white',
        outline: 'border border-border text-foreground bg-transparent',
        // Court level variants
        provincial: 'bg-emerald-500/15 text-emerald-400',
        supreme: 'bg-purple-500/15 text-purple-400',
        circuit: 'bg-amber-500/15 text-amber-400',
        // Region color variants
        emerald: 'bg-emerald-500/15 text-emerald-400',
        blue: 'bg-blue-500/15 text-blue-400',
        amber: 'bg-amber-500/15 text-amber-400',
        purple: 'bg-purple-500/15 text-purple-400',
        rose: 'bg-rose-500/15 text-rose-400',
        sky: 'bg-sky-500/15 text-sky-400',
        slate: 'bg-slate-500/15 text-slate-400',
      },
      size: {
        sm: 'px-1.5 py-0.5',
        md: 'px-2 py-1',
        lg: 'px-2.5 py-1.5',
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
