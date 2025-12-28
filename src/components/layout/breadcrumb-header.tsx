"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useSidebar } from "@/components/ui/sidebar"
import { useSidebarControl } from "@/contexts/sidebar-control-context"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  actions?: React.ReactNode
}

export function BreadcrumbHeader({ breadcrumbs, actions }: BreadcrumbHeaderProps) {
  const { toggleSidebar, open } = useSidebar()
  const { closeDocuments } = useSidebarControl()

  const handleToggle = () => {
    if (open) {
      closeDocuments() // Close document sidebar if open
    }
    toggleSidebar() // Toggle main sidebar
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Toggle + Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Actions slot */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
