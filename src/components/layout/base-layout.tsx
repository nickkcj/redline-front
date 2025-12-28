"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DocumentSidebar } from "./document-sidebar"
import { DocumentViewerPanel } from "./document-viewer-panel"
import { useDocumentViewer } from "@/contexts/document-viewer-context"
import { useSidebarControl } from "@/contexts/sidebar-control-context"

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
}

export function BaseLayout({ children, className }: BaseLayoutProps) {
  const { isOpen: isDocumentViewerOpen } = useDocumentViewer()
  const { documentsOpen } = useSidebarControl()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex">
        {/* Document Sidebar (secondary sidebar) */}
        {documentsOpen && <DocumentSidebar />}

        {/* Main Content Area - 50% when viewer is open */}
        <div
          className={`flex-1 min-w-0 ${className || ''}`}
          style={{
            width: isDocumentViewerOpen ? '50%' : '100%',
          }}
        >
          {children}
        </div>

        {/* Document Viewer Panel - 50% width on the right */}
        {isDocumentViewerOpen && <DocumentViewerPanel />}
      </SidebarInset>
    </SidebarProvider>
  )
}
