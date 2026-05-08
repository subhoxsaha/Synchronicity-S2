import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border-[2px] border-foreground px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider whitespace-nowrap shadow-[2px_2px_0_0_var(--border)] transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-background text-foreground",
        ghost: "border-transparent shadow-none bg-muted text-muted-foreground",
        link: "border-transparent shadow-none text-primary underline-offset-4 hover:underline",
        pink: "bg-brutal-pink text-white",
        blue: "bg-brutal-blue text-white",
        green: "bg-brutal-green text-foreground",
        purple: "bg-brutal-purple text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
