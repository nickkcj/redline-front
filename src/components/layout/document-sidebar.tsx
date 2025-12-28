"use client"

import * as React from "react"
import { File, Upload, X, MoreVertical, Eye, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useDocuments, useUploadDocumentWithProgress, useDeleteDocument } from "@/hooks/api/use-documents"
import { useDocumentViewer } from "@/contexts/document-viewer-context"
import { useSidebarControl } from "@/contexts/sidebar-control-context"
import { useCurrentWorkspace } from "@/lib/stores/app.store"
import { usePermissions } from "@/hooks/api/use-permissions"
import { hasAnyPermission as hasAnyPermissionUtil } from "@/lib/utils/permission.utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DocumentSidebarProps {
  className?: string
}

export function DocumentSidebar({ className }: DocumentSidebarProps) {
  const currentWorkspace = useCurrentWorkspace()
  const { documentsOpen, closeDocuments } = useSidebarControl()
  const { openDocument } = useDocumentViewer()

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch documents and permissions
  const { data: documents = [], isLoading } = useDocuments(currentWorkspace?.id || '', {
    enabled: !!currentWorkspace?.id && documentsOpen,
  })

  const { data: userPermissions = [] } = usePermissions(currentWorkspace?.id || '')

  const canWrite = hasAnyPermissionUtil(userPermissions, ['documents.write.own', 'documents.write.all'])
  const canDelete = hasAnyPermissionUtil(userPermissions, ['documents.delete.all'])

  // Upload mutation
  const {
    uploadWithProgress,
    uploadProgress,
    isUploading,
  } = useUploadDocumentWithProgress(currentWorkspace?.id || '')

  // Delete mutation
  const { mutate: deleteDocument } = useDeleteDocument(currentWorkspace?.id || '')

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    try {
      await uploadWithProgress({
        file,
        name: file.name,
      })
      toast.success('Documento enviado com sucesso!')
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Error toast is handled by the mutation
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleViewDocument = (documentId: string, documentName: string) => {
    openDocument(documentId, documentName)
    closeDocuments() // Close documents sidebar when opening viewer
  }

  const handleDeleteDocument = (documentId: string, documentName: string) => {
    if (confirm(`Tem certeza que deseja deletar "${documentName}"?`)) {
      deleteDocument(documentId, {
        onSuccess: () => {
          toast.success('Documento deletado com sucesso!')
        },
      })
    }
  }

  // Drag handlers for dragging documents to chat
  const handleDragStart = (e: React.DragEvent, documentId: string, documentName: string) => {
    e.dataTransfer.setData('application/document-ids', JSON.stringify([documentId]))
    e.dataTransfer.setData('application/document-names', JSON.stringify([documentName]))
    e.dataTransfer.effectAllowed = 'copy'
  }

  if (!documentsOpen) {
    return null
  }

  return (
    <Sidebar
      className={cn("border-r", className)}
      collapsible="none"
      side="left"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold text-base">Documentos</h3>
          <div className="flex items-center gap-2">
            {canWrite && (
              <>
                <Button
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDocuments}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="px-3 pb-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enviando...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Carregando documentos...</p>
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Nenhum documento</p>
            <p className="text-xs text-muted-foreground mb-4">
              Faça upload do primeiro documento
            </p>
            {canWrite && (
              <Button size="sm" onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        )}

        {!isLoading && documents.length > 0 && (
          <SidebarMenu>
            {documents.map((doc) => (
              <SidebarMenuItem key={doc.id}>
                <SidebarMenuButton
                  onClick={() => handleViewDocument(doc.id, doc.name)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc.id, doc.name)}
                  className="cursor-pointer"
                >
                  <File className="h-4 w-4" />
                  <span className="truncate">{doc.name}</span>
                </SidebarMenuButton>

                <SidebarMenuAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDocument(doc.id, doc.name)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteDocument(doc.id, doc.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
