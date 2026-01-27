"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FloatingSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  header?: React.ReactNode
  isOpen: boolean
}

export function FloatingSidebar({
  title,
  header,
  isOpen,
  children,
  className,
  ...props
}: FloatingSidebarProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed top-0 z-40 h-screen w-64 border-r bg-sidebar shadow-xl animate-in slide-in-from-left-5 fade-in duration-200",
        className
      )}
      style={{
        left: "calc(var(--sidebar-width-icon) - 1px)",
      }}
      {...props}
    >
      <div className="flex h-full flex-col">
        {header && header}
        {!header && title && (
          <div className="flex h-10 items-center border-b px-4">
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
