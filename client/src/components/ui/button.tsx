import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-[2.5px] border-foreground bg-clip-padding text-sm font-bold whitespace-nowrap outline-none select-none transition-[transform,box-shadow] duration-100 ease-out hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_var(--border)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--border)]",
        outline:
          "bg-background text-foreground shadow-[4px_4px_0_0_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_0_0_var(--border)]",
        ghost:
          "border-transparent shadow-none hover:border-foreground hover:shadow-[4px_4px_0_0_var(--border)] hover:translate-x-0 hover:translate-y-0 active:translate-x-[2px] active:translate-y-[2px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[4px_4px_0_0_var(--border)]",
        link: "border-transparent text-primary underline-offset-4 hover:underline shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-[4px_4px_0_0_var(--border)]",
      },
      size: {
        default: "h-11 px-6",
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        "icon-xs": "h-6 w-6",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
