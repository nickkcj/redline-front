'use client'

import * as React from 'react'
import { File, MagnifyingGlass, Plus, Funnel, ArrowsDownUp, DotsThree, Trash, Eye, DownloadSimple, SpinnerGap, CloudArrowUp, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDocuments, useUploadDocumentWithProgress, useDeleteDocument, downloadDocument } from '@/hooks/api/use-documents'
import { useCurrentWorkspace } from '@/lib/stores/app.store'
import { useWorkspaceStore } from '@/store/workspace-store'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function FilesView() {
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ''
  const { addTabInNewWindow } = useWorkspaceStore()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [docToDelete, setDocToDelete] = React.useState<{ id: string; name: string } | null>(null)

  const { data: documents = [], isLoading } = useDocuments(workspaceId, { take: 100 })
  const { uploadWithProgress, uploadProgress, isUploading } = useUploadDocumentWithProgress(workspaceId)
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument(workspaceId)

  const filteredDocuments = React.useMemo(() => {
    if (!searchQuery.trim()) return documents
    const q = searchQuery.toLowerCase()
    return documents.filter((doc) => doc.name.toLowerCase().includes(q))
  }, [documents, searchQuery])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    try {
      await uploadWithProgress({ file, name: file.name })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleDelete = () => {
    if (!docToDelete) return
    deleteDoc(docToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        setDocToDelete(null)
      },
    })
  }

  const handleDownload = async (docId: string, docName: string) => {
    try {
      const blob = await downloadDocument(workspaceId, docId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = docName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleOpenDocument = (docId: string, docName: string) => {
    addTabInNewWindow('document', docName, { documentId: docId })
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-8 gap-8 overflow-hidden">
      <div className="flex-none space-y-2">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">Gerencie os documentos do workspace.</p>
      </div>

      {isUploading && (
        <div className="flex-none space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enviando documento...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 gap-4">
        {/* Toolbar */}
        <div className="flex-none flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-muted-foreground/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-9 gap-2"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudArrowUp className="h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Enviar Documento'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Document List */}
        <Card className="flex-1 min-h-0 border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0 h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <File className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
                <p className="text-sm text-muted-foreground mb-4">Envie o primeiro documento para começar</p>
                <Button
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudArrowUp className="h-4 w-4 mr-2" />
                  Enviar Documento
                </Button>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MagnifyingGlass className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhum documento encontrado para &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors cursor-pointer group"
                      onClick={() => handleOpenDocument(doc.id, doc.name)}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-background rounded-md border shrink-0">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.sizeBytes)} &middot; {formatDate(doc.createdAt)}
                          {doc.contentType && ` · ${doc.contentType.split('/').pop()?.toUpperCase()}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {doc.isProcessed ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle weight="fill" className="h-3.5 w-3.5" /> Processado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <SpinnerGap className="h-3.5 w-3.5 animate-spin" /> Processando
                          </span>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DotsThree className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDocument(doc.id, doc.name)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(doc.id, doc.name)
                              }}
                            >
                              <DownloadSimple className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDocToDelete({ id: doc.id, name: doc.name })
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{docToDelete?.name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
