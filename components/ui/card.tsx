import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// =============================================================================
// CARD VARIANTS
// =============================================================================

const cardVariants = cva(
  "rounded-xl text-card-foreground",
  {
    variants: {
      variant: {
        default: "border bg-card shadow",
        // List variant - for grouped list items (like court index)
        list: "bg-slate-800/20 divide-y divide-slate-700/30 overflow-hidden",
        // Ghost variant - minimal styling
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
// =============================================================================

const CardListItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "w-full text-left px-4 py-3 transition-colors",
      "hover:bg-slate-800/30 active:bg-slate-800/50",
      "focus-visible:outline-none focus-visible:bg-slate-800/30",
      className
    )}
    {...props}
  />
))
CardListItem.displayName = "CardListItem"

// =============================================================================
// CARD LIST ITEM TITLE
// =============================================================================

const CardListItemTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium text-slate-200", className)}
    {...props}
  />
))
CardListItemTitle.displayName = "CardListItemTitle"

// =============================================================================
// CARD LIST ITEM DESCRIPTION
// =============================================================================

const CardListItemDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1.5 flex-wrap mt-1.5", className)}
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
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  // New list item components
  CardListItem,
  CardListItemTitle,
  CardListItemDescription,
}
