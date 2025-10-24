import * as React from "react"
import { Slot } from "@radix-ui/react-slot" // Needed for 'asChild' prop
import { cva, type VariantProps } from "class-variance-authority" // For style variants

import { cn } from "./lib/utils" // Import class merging utility

// Define button style variants using cva
const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      // Different visual styles
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500", // Primary button
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",    // Danger/delete button
        outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 focus-visible:ring-gray-400", // Secondary/outline button
        teal: "bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:ring-teal-500", // Teal variant for dashboard filters etc.
        ghost: "hover:bg-gray-100 hover:text-gray-900", // Minimal button
      },
      // Different sizes
      size: {
        default: "h-10 py-2 px-4",       // Standard size
        sm: "h-9 rounded-md px-3",       // Small size
        lg: "h-11 rounded-md px-8",       // Large size
        icon: "h-10 w-10",              // Square size for icon-only buttons
      },
    },
    // Default styles if variant/size not specified
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Define component props, extending standard button attributes and cva variants
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean // Optional prop to render as a different element (e.g., Link)
}

// Create the Button component using React.forwardRef
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Use Slot if asChild is true, otherwise use a standard button
    const Comp = asChild ? Slot : "button"
    return (
      // Apply merged classes (base + variant + size + custom className)
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref} // Forward the ref
        {...props} // Pass down all other props
      />
    )
  }
)
Button.displayName = "Button" // Set display name for DevTools

// Export the component and the variants definition
export { Button, buttonVariants }