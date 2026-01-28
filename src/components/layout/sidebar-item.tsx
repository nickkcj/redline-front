"use client"

import * as React from "react"
import { Icon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: Icon
  imageSrc?: string
  label: string
  isActive?: boolean
  isHovered?: boolean
  showLabel?: boolean
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ icon: IconComponent, imageSrc, label, isActive, isHovered, showLabel = true, className, ...props }, ref) => {
    const [isHovering, setIsHovering] = React.useState(false)
    
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "group relative h-auto py-1 w-full flex-col items-center justify-center gap-0.5 rounded-none transition-colors hover:bg-transparent",
          isActive ? "text-foreground" : "text-muted-foreground",
          className
        )}
        onMouseEnter={(e) => {
          setIsHovering(true)
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setIsHovering(false)
          props.onMouseLeave?.(e)
        }}
        {...props}
      >
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            "group-hover:bg-sidebar-accent",
            isActive && "bg-sidebar-accent text-foreground",
            isHovered && "bg-sidebar-accent text-foreground"
          )}
        >
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={label} 
              className="h-7 w-7 rounded-md object-cover" 
            />
          ) : IconComponent && (
            <IconComponent 
              weight={isHovering || isActive || isHovered ? "fill" : "regular"} 
              className="h-7 w-7 transition-all duration-150" 
            />
          )}
        </div>
        {showLabel && <span className="text-[10px] font-medium">{label}</span>}
      </Button>
    )
  }
)
SidebarItem.displayName = "SidebarItem"
