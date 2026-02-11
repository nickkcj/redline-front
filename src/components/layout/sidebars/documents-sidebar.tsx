'use client'

import * as React from 'react'
import { FileText, File, Plus } from '@phosphor-icons/react'
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

interface Document {
  id: number
  nome: string
  tipo: string
  data?: string
}

interface DocumentsSidebarProps {
  documents?: Document[]
  onDocumentSelect?: (id: number) => void
  selectedDocId?: number | null
}

export function DocumentsSidebar({
  documents = [],
  onDocumentSelect,
  selectedDocId,
}: DocumentsSidebarProps) {

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return FileText
      case 'docx': return FileText
      default: return File
    }
  }

  return (
    <SidebarListBase
      title="Files"
      actions={
        <div className="flex flex-col gap-1 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            title="Upload File"
          >
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            <span>Upload File</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            title="New Doc"
          >
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            <span>New Doc</span>
          </Button>
        </div>
      }
    >
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No files yet</p>
          <p className="text-xs text-muted-foreground/70">Upload a file to get started</p>
        </div>
      ) : (
        <SidebarGroup title="Recent">
          {documents.map((doc) => (
            <SidebarListItem
              key={doc.id}
              icon={getIcon(doc.tipo)}
              label={doc.nome}
              active={selectedDocId === doc.id}
              onClick={() => onDocumentSelect?.(doc.id)}
              endContent={
                doc.data && (
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {doc.data}
                  </span>
                )
              }
            />
          ))}
        </SidebarGroup>
      )}
    </SidebarListBase>
  )
}
