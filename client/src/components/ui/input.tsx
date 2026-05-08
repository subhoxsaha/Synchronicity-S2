import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border-[2.5px] border-foreground bg-background px-4 py-2 text-sm transition-[box-shadow] duration-100 outline-none placeholder:text-muted-foreground/60 focus:shadow-[4px_4px_0_0_var(--border)] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
