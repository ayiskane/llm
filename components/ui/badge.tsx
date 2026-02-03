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
        // Court-specific variants
        provincial: "border-transparent bg-emerald-500/15 text-emerald-400 ",
        supreme: "border-transparent bg-purple-500/15 text-purple-400 ",
        circuit: "border-transparent bg-amber-500/15 text-amber-400",
        region: "border bg-white/5 border-slate-700/50 text-slate-400 font-mono",
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
