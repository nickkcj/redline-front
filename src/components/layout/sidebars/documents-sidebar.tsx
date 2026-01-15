'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FileText, Plus, ChevronRight } from 'lucide-react'

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
  { id: 1, nome: 'Proposta Projeto A', tipo: 'PDF', data: 'Há 2 dias' },
  { id: 2, nome: 'Contrato Cliente B', tipo: 'DOCX', data: 'Há 3 dias' },
  { id: 3, nome: 'Relatório Mensal', tipo: 'PDF', data: 'Há 1 semana' },
  { id: 4, nome: 'Especificações Técnicas', tipo: 'PDF', data: 'Há 2 semanas' },
]

export function DocumentsSidebar({
  documents = defaultDocuments,
  onDocumentSelect,
  selectedDocId,
}: DocumentsSidebarProps) {
  const [selectedDoc, setSelectedDoc] = React.useState<number | null>(
    selectedDocId || null
  )

  const handleDocumentClick = (id: number) => {
    setSelectedDoc(id)
    onDocumentSelect?.(id)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Documentos</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Visualize e gerencie seus documentos
        </p>
      </div>

      {/* Lista de documentos */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">
              RECENTES
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleDocumentClick(doc.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                selectedDoc === doc.id ? 'bg-accent' : 'bg-background'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.tipo}
                      {doc.data && ` • ${doc.data}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {selectedDoc && (
          <>
            <Separator className="my-4" />

            {/* Preview */}
            <div className="p-4">
              <div className="rounded-lg border bg-background p-4">
                <h3 className="text-sm font-semibold mb-2">Pré-visualização</h3>
                <div className="aspect-3/4 rounded border bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-xs">Visualização do documento</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" size="sm">
                    Abrir Documento
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  )
}
