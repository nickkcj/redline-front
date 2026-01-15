import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-ring/30 selection:text-foreground flex field-sizing-content min-h-16 w-full rounded-sm bg-transparent px-2 py-1.5 text-sm transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "border border-input hover:border-foreground/20 focus:border-ring focus:ring-1 focus:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
