"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Search, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocumentResponseDto } from "@/lib/api/types/document.types"

export interface DocumentSelectorProps {
  documents: DocumentResponseDto[]
  markedDocumentIds: string[]
  onToggleDocument: (documentId: string, marked: boolean) => void
  disabled?: boolean
  className?: string
}

export function DocumentSelector({
  documents,
  markedDocumentIds,
  onToggleDocument,
  disabled = false,
  className,
}: DocumentSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredDocuments = React.useMemo(() => {
    if (!search.trim()) return documents

    const searchLower = search.toLowerCase()
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchLower)
    )
  }, [documents, search])

  const markedDocuments = React.useMemo(
    () => documents.filter((doc) => markedDocumentIds.includes(doc.id)),
    [documents, markedDocumentIds]
  )

  const isDocumentMarked = (documentId: string) =>
    markedDocumentIds.includes(documentId)

  const handleToggle = (documentId: string) => {
    const isMarked = isDocumentMarked(documentId)
    onToggleDocument(documentId, !isMarked)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-2 text-muted-foreground hover:text-foreground",
            markedDocuments.length > 0 && "text-foreground",
            className
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm">
            Documentos
            {markedDocuments.length > 0 && ` (${markedDocuments.length})`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col h-[400px]">
          {/* Header */}
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm mb-2">Documentos do Workspace</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Selecione documentos para adicionar ao contexto do chat
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Marked Documents */}
          {markedDocuments.length > 0 && (
            <div className="p-3 border-b bg-accent/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Selecionados ({markedDocuments.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    markedDocuments.forEach((doc) => onToggleDocument(doc.id, false))
                  }}
                >
                  Limpar todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {markedDocuments.map((doc) => (
                  <Badge
                    key={doc.id}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    <span className="truncate max-w-[120px]">{doc.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleDocument(doc.id, false)
                      }}
                      className="hover:bg-background rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Document List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search.trim()
                      ? "Nenhum documento encontrado"
                      : "Nenhum documento disponível"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredDocuments.map((doc) => {
                    const marked = isDocumentMarked(doc.id)
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggle(doc.id)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                          "hover:bg-accent",
                          marked && "bg-accent"
                        )}
                      >
                        <Checkbox
                          checked={marked}
                          onCheckedChange={() => handleToggle(doc.id)}
                          className="pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {marked && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
