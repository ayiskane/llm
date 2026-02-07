import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// =============================================================================
// CARD VARIANTS
// =============================================================================

const cardVariants = cva(
  "text-card-foreground",
  {
    variants: {
      variant: {
        default: "border bg-card shadow",
        list: "bg-list-item-bg divide-y divide-border overflow-hidden",
        ghost: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// =============================================================================
// CARD
// =============================================================================

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  />
))
Card.displayName = "Card"

// =============================================================================
// CARD LIST ITEM - Clickable row for list variant cards
// Uses CSS variables from globals.css for consistent theming
// =============================================================================

const CardListItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outlined"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "w-full text-left px-4 py-3 transition-colors",
      "hover:bg-list-item-hover active:bg-list-item-active",
      "focus-visible:outline-none focus-visible:bg-list-item-hover",
      variant === "outlined" &&
        "bg-list-item-bg border border-slate-700/50 -mt-px first:mt-0 first:rounded-t-lg last:rounded-b-lg",
      className
    )}
    {...props}
  />
))
CardListItem.displayName = "CardListItem"

// =============================================================================
// CARD LIST ROW - Non-button row (for nested actions)
// =============================================================================

const CardListRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "outlined"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full text-left px-4 py-3 transition-colors",
      "hover:bg-list-item-hover active:bg-list-item-active",
      variant === "outlined" &&
        "bg-list-item-bg border border-slate-700/50 -mt-px first:mt-0 first:rounded-t-lg last:rounded-b-lg",
      className
    )}
    {...props}
  />
))
CardListRow.displayName = "CardListRow"

// =============================================================================
// CARD LIST ALERT - Reusable alert row with icon + optional trailing
// =============================================================================

const CardListItemAlert = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: React.ReactNode
    iconWrapClassName?: string
    iconClassName?: string
    contentClassName?: string
    trailing?: React.ReactNode
  }
>(
  (
    {
      className,
      icon,
      iconWrapClassName,
      iconClassName,
      contentClassName,
      trailing,
      children,
      ...props
    },
    ref
  ) => (
  <CardListItem
    ref={ref}
    className={cn("flex items-center gap-2.5 rounded-xl", className)}
    {...props}
  >
    <div
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        iconWrapClassName
      )}
    >
      <span className={cn("w-4 h-4", iconClassName)}>{icon}</span>
    </div>
    <div className={cn("flex-1 min-w-0", contentClassName)}>{children}</div>
    {trailing}
  </CardListItem>
))
CardListItemAlert.displayName = "CardListItemAlert"

const CardListItemTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
))
CardListItemTitle.displayName = "CardListItemTitle"

const CardListItemDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1.5 flex-wrap mt-1.5 text-muted-foreground", className)}
    {...props}
  />
))

CardListItemDescription.displayName = "CardListItemDescription"

// =============================================================================
// STANDARD CARD COMPONENTS
// =============================================================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardListItem,
  CardListRow,
  CardListItemAlert,
  CardListItemTitle,
  CardListItemDescription,
}
