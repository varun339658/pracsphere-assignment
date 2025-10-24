  import * as React from "react"
  import { cn } from "./lib/utils" // Import class merging utility

  // Main Card container component
  const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        // Base styles: rounded, border, background, shadow. Merges with custom className.
        className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)}
        {...props} // Pass down other props
      />
  ));
  Card.displayName = "Card";

  // Card Header component (optional part)
  const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        // Base styles: flex column, spacing, padding. Merges with custom className.
        className={cn("flex flex-col space-y-1.5 p-6", className)} // Added default padding
        {...props}
      />
  ));
  CardHeader.displayName = "CardHeader";

  // Card Title component (optional part, usually inside Header)
  const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
      <h3
        ref={ref}
        // Base styles: font size, weight, line height, tracking. Merges with custom className.
        className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900", className)}
        {...props}
      />
  ));
  CardTitle.displayName = "CardTitle";

  // Card Description component (optional part, usually inside Header)
  const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
      <p
        ref={ref}
        // Base styles: font size, text color. Merges with custom className.
        className={cn("text-sm text-gray-500", className)}
        {...props}
      />
  ));
  CardDescription.displayName = "CardDescription";

  // Card Content component (main body of the card)
  const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        // Base styles: padding (can be overridden). Merges with custom className.
        className={cn("p-6 pt-0", className)} // Default padding, removed top padding if Header used
        {...props}
      />
  ));
  CardContent.displayName = "CardContent";

  // Card Footer component (optional part)
  const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        // Base styles: flex items-center, padding. Merges with custom className.
        className={cn("flex items-center p-6 pt-0", className)} // Default padding, removed top padding
        {...props}
      />
  ));
  CardFooter.displayName = "CardFooter";

  // Export all parts of the Card component
  export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };