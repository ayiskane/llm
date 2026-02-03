import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "px-1.5 py-0.5 text-[9px] font-medium inline-flex rounded tracking-widest uppercase",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 px-2.5 py-0.5 text-xs",
        // Court-specific variants using CSS variables from globals.css
        provincial: "border-transparent bg-semantic-emerald-bg text-semantic-emerald-text",
        supreme: "border-transparent bg-semantic-purple-bg text-semantic-purple-text",
        circuit: "border-transparent bg-semantic-amber-bg text-semantic-amber-text",
        region: "border bg-foreground/5 border-border/50 text-muted-foreground font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
