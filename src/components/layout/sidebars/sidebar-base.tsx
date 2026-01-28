import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SidebarListBaseProps {
  title: string
  actions?: React.ReactNode
  headerActions?: React.ReactNode
  children: React.ReactNode
}

export function SidebarListBase({ title, actions, headerActions, children }: SidebarListBaseProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-sm font-medium">{title}</span>
        {headerActions && (
          <div className="flex items-center gap-1">
            {headerActions}
          </div>
        )}
      </div>

      {actions && (
        <div className="px-2 pb-2 shrink-0">
          {actions}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 [&>div:not(:first-child)_.group-separator]:block">
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}

interface SidebarGroupProps {
  title: string
  children: React.ReactNode
}

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="space-y-[1px] mb-2">
      <div className="group-separator hidden mb-2 mt-2 px-2">
        <Separator className="bg-border/50" />
      </div>
      <h3 className="px-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <div className="space-y-[1px]">
        {children}
      </div>
    </div>
  )
}

interface SidebarListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType
  label: string
  active?: boolean
  endContent?: React.ReactNode
}

export function SidebarListItem({ 
  icon: Icon, 
  label, 
  active, 
  endContent, 
  className,
  ...props 
}: SidebarListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-colors text-sm",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80",
        className
      )}
      {...props}
    >
      <div className="opacity-70 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="relative flex-1 min-w-0">
          <span className="block truncate text-xs pr-4">
            {label}
          </span>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-sidebar to-transparent pointer-events-none group-hover:from-sidebar-accent/50" />
        </div>
        
        {endContent}
      </div>
    </div>
  )
}
