"use client"

import * as React from "react"
import { Icon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

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
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const button = (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "group relative h-auto py-2 px-3 w-full flex-row items-center justify-start gap-3 rounded-none transition-colors hover:bg-transparent overflow-hidden",
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
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
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
        <span className="text-sm font-medium truncate whitespace-nowrap">{label}</span>
      </Button>
    )

    if (isCollapsed && showLabel) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={10}
            className="bg-[#0f0f0f] text-white border-none font-semibold shadow-xl px-3 py-1.5 rounded-md text-xs"
          >
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
SidebarItem.displayName = "SidebarItem"
