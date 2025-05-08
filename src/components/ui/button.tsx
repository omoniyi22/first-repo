
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Updated custom variants based on the style guide
        dressage: "bg-gradient-to-br from-dressage-light to-dressage-dark text-white shadow-md hover:shadow-lg",
        jump: "bg-gradient-to-br from-jump-light to-jump-dark text-white shadow-md hover:shadow-lg",
        secondaryGradient: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm hover:shadow-md",
        tertiary: "bg-transparent hover:underline",
        outlineDressage: "bg-white border-2 border-dressage text-dressage hover:bg-dressage/5",
        outlineJump: "bg-white border-2 border-jump text-jump hover:bg-jump/5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-8 py-3 text-base",
        icon: "h-10 w-10",
      },
      weight: {
        default: "font-medium",
        normal: "font-normal",
        bold: "font-bold",
      },
      fullWidth: {
        true: "w-full",
      },
      animation: {
        default: "",
        scale: "active:scale-[0.98] transition-transform",
        bounce: "hover:-translate-y-0.5 active:translate-y-0 transition-transform",
      },
      textCase: {
        default: "",
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "default",
      animation: "scale",
      textCase: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  fullWidth?: boolean
  weight?: "default" | "normal" | "bold"
  animation?: "default" | "scale" | "bounce"
  textCase?: "default" | "uppercase" | "lowercase" | "capitalize"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, weight, animation, textCase, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, weight, animation, textCase, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
