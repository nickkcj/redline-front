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

const defaultDocuments: Document[] = [
  { id: 1, nome: 'Proposta Projeto A', tipo: 'PDF', data: '2d' },
  { id: 2, nome: 'Contrato Cliente B', tipo: 'DOCX', data: '3d' },
  { id: 3, nome: 'Relatório Mensal', tipo: 'PDF', data: '1w' },
  { id: 4, nome: 'Especificações Técnicas', tipo: 'PDF', data: '2w' },
]

export function DocumentsSidebar({
  documents = defaultDocuments,
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
      <SidebarGroup title="Recentes">
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
    </SidebarListBase>
  )
}
