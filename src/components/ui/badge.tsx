import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-normal transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-tag-red text-tag-red-foreground",
        outline: 
          "border border-input bg-transparent text-foreground",
        // Notion tag colors
        red: "bg-tag-red text-tag-red-foreground",
        orange: "bg-tag-orange text-tag-orange-foreground",
        yellow: "bg-tag-yellow text-tag-yellow-foreground",
        green: "bg-tag-green text-tag-green-foreground",
        blue: "bg-tag-blue text-tag-blue-foreground",
        purple: "bg-tag-purple text-tag-purple-foreground",
        pink: "bg-tag-pink text-tag-pink-foreground",
        gray: "bg-tag-gray text-tag-gray-foreground",
        brown: "bg-tag-brown text-tag-brown-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
