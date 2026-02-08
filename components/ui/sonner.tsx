"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Styled Toaster matching the original Toast component appearance.
 * Compact, centered at bottom (above bottom nav), minimal styling.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group bottom-20!"
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "px-4 py-2 rounded-lg bg-background/95 text-foreground text-sm shadow-lg border border-border/50 flex items-center gap-2",
          success: "text-foreground",
          error: "text-destructive",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
