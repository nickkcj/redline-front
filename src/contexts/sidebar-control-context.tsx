"use client"

import React, { createContext, useContext } from 'react'
import { useSidebarState } from '@/hooks/use-sidebar-state'

interface SidebarControlContextType {
  // Documents Sidebar
  documentsOpen: boolean
  openDocuments: () => void
  closeDocuments: () => void
  toggleDocuments: () => void
}

const SidebarControlContext = createContext<SidebarControlContextType | undefined>(undefined)

export function SidebarControlProvider({ children }: { children: React.ReactNode }) {
  const {
    isOpen: documentsOpen,
    open: openDocuments,
    close: closeDocuments,
    toggle: toggleDocuments
  } = useSidebarState('documents', false)

  const value: SidebarControlContextType = {
    documentsOpen,
    openDocuments,
    closeDocuments,
    toggleDocuments
  }

  return (
    <SidebarControlContext.Provider value={value}>
      {children}
    </SidebarControlContext.Provider>
  )
}

export function useSidebarControl() {
  const context = useContext(SidebarControlContext)
  if (context === undefined) {
    throw new Error('useSidebarControl must be used within a SidebarControlProvider')
  }
  return context
}
