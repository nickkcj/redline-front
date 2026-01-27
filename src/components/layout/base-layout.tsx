"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DocumentViewerPanel } from "./document-viewer-panel"
import { UnifiedDocumentViewer } from "@/components/shared/viewers"
import { useDocumentViewer, DocumentViewerProvider } from "@/contexts/document-viewer-context"
import { SearchProvider, useSearch } from "@/contexts/search-context"
import { SearchCommand } from "@/components/workspace/search-command"

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
}

function BaseLayoutContent({ children, className }: BaseLayoutProps) {
  const { isOpen: isDocumentViewerOpen } = useDocumentViewer()
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch()

  return (
    <>
      <div className="flex h-screen w-full">
        {/* Main Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-row min-w-0">
          <div
            className={`h-full ${className || ''}`}
            style={{
              width: isDocumentViewerOpen ? '50%' : '100%',
              transition: 'width 0.2s ease-in-out',
            }}
          >
            {children}
          </div>

          {/* Document Viewer Panel - 50% width on the right */}
          {isDocumentViewerOpen && <DocumentViewerPanel />}
        </SidebarInset>
      </div>
      
      {/* Unified Document Viewer Modal */}
      <UnifiedDocumentViewer />
      
      {/* Global Search Command */}
      <SearchCommand open={isSearchOpen} setOpen={(open) => open ? openSearch() : closeSearch()} />
    </>
  )
}

export function BaseLayout({ children, className }: BaseLayoutProps) {
  return (
    <SidebarProvider>
      <SearchProvider>
        <DocumentViewerProvider>
          <BaseLayoutContent className={className}>
            {children}
          </BaseLayoutContent>
        </DocumentViewerProvider>
      </SearchProvider>
    </SidebarProvider>
  )
}
