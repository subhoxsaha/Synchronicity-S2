import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full border-[2.5px] border-foreground bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:shadow-[4px_4px_0_0_var(--border)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-[box-shadow] duration-100",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
