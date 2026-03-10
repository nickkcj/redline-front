"use client"

import * as React from "react"
import {
  File,
  FilePdf,
  FileDoc,
  FileXls,
  FileImage,
  MagnifyingGlass,
  DotsThree,
  Trash,
  Eye,
  DownloadSimple,
  SpinnerGap,
  CloudArrowUp,
  CheckCircle,
  Funnel,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { DocumentViewerSheet } from "@/components/features/documents/document-viewer-sheet"
import {
  useDocuments,
  useUploadDocumentWithProgress,
  useDeleteDocument,
  downloadDocument,
} from "@/hooks/api/use-documents"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"

/**
 * Formats file size in bytes to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Returns the appropriate icon and color for a file type
 */
function getFileIcon(contentType: string): {
  icon: Icon
  color: string
  label: string
} {
  const type = contentType.toLowerCase()

  if (type.includes("pdf")) {
    return { icon: FilePdf, color: "text-red-500", label: "PDF" }
  }
  if (
    type.includes("word") ||
    type.includes("document") ||
    type.includes("msword")
  ) {
    return { icon: FileDoc, color: "text-blue-500", label: "Word" }
  }
  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("sheet")
  ) {
    return { icon: FileXls, color: "text-green-500", label: "Excel" }
  }
  if (type.includes("image")) {
    return { icon: FileImage, color: "text-purple-500", label: "Imagem" }
  }

  return { icon: File, color: "text-muted-foreground", label: "Arquivo" }
}

/**
 * Determines the filter category for a content type
 */
function getContentTypeCategory(contentType: string): string {
  const type = contentType.toLowerCase()

  if (type.includes("pdf")) return "pdf"
  if (
    type.includes("word") ||
    type.includes("document") ||
    type.includes("msword")
  )
    return "word"
  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("sheet")
  )
    return "excel"
  if (type.includes("image")) return "image"

  return "other"
}

export default function DocumentsPage() {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ""
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [docToDelete, setDocToDelete] = React.useState<{
    id: string
    name: string
  } | null>(null)
  const [viewingDoc, setViewingDoc] = React.useState<{
    id: string
    name: string
  } | null>(null)

  const { data: documents = [], isLoading } = useDocuments(workspaceId, {
    take: 100,
  })
  const { uploadWithProgress, uploadProgress, isUploading } =
    useUploadDocumentWithProgress(workspaceId)
  const { mutate: deleteDoc, isPending: isDeleting } =
    useDeleteDocument(workspaceId)

  const filteredDocuments = React.useMemo(() => {
    let filtered = documents

    if (filterType !== "all") {
      filtered = filtered.filter(
        (doc) => getContentTypeCategory(doc.contentType) === filterType
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((doc) => doc.name.toLowerCase().includes(q))
    }

    return filtered
  }, [documents, searchQuery, filterType])

  /**
   * Handles file upload via input change
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    try {
      await uploadWithProgress({ file, name: file.name })
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Upload error:", error)
    }
  }

  /**
   * Opens the document viewer sheet
   */
  const handleViewDocument = (id: string, name: string) => {
    setViewingDoc({ id, name })
  }

  /**
   * Handles document deletion
   */
  const handleDelete = () => {
    if (!docToDelete) return
    deleteDoc(docToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false)
        setDocToDelete(null)
      },
    })
  }

  /**
   * Downloads a document to the user's device
   */
  const handleDownload = async (docId: string, docName: string) => {
    try {
      const blob = await downloadDocument(workspaceId, docId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = docName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const breadcrumbs = [
    { label: currentOrganization?.name || "Organização", href: "/" },
    { label: currentWorkspace?.name || "Workspace" },
    { label: "Documentos" },
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudArrowUp className="h-4 w-4 mr-2" />
        {isUploading ? "Enviando..." : "Enviar Documento"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} actions={actions} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Header Section */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie e visualize os documentos do seu workspace
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Enviando documento...
                    </span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter Controls */}
          {documents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Funnel className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="image">Imagens</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Carregando documentos...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && documents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum documento
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Envie o primeiro documento para começar a organizar seus
                  arquivos
                </p>
                <Button
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudArrowUp className="h-4 w-4 mr-2" />
                  Enviar Documento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Document List */}
          {!isLoading && filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => {
                const { icon: IconComponent, color } = getFileIcon(
                  doc.contentType
                )
                return (
                  <Card
                    key={doc.id}
                    className="hover:bg-accent/50 cursor-pointer transition-colors group"
                    onClick={() => handleViewDocument(doc.id, doc.name)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <IconComponent
                          className={`h-8 w-8 ${color}`}
                          weight="fill"
                        />
                      </div>

                      {/* Name + Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate mb-1">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.sizeBytes)}
                          {doc.description && (
                            <span>
                              {" "}
                              &middot; {doc.description}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="hidden sm:flex items-center flex-shrink-0">
                        {doc.isProcessed ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                          >
                            <CheckCircle
                              weight="fill"
                              className="h-3 w-3 mr-1"
                            />
                            Processado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                          >
                            <SpinnerGap className="h-3 w-3 mr-1 animate-spin" />
                            Processando
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DotsThree weight="bold" className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDocument(doc.id, doc.name)
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
                              className="text-red-600 focus:text-red-600"
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* No search results */}
          {!isLoading &&
            documents.length > 0 &&
            filteredDocuments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <MagnifyingGlass className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="text-sm font-medium mb-1">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tente ajustar sua busca ou filtro
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Document Viewer Sheet */}
      <DocumentViewerSheet
        open={!!viewingDoc}
        onOpenChange={(open) => !open && setViewingDoc(null)}
        workspaceId={workspaceId}
        documentId={viewingDoc?.id || ""}
        documentName={viewingDoc?.name || ""}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{docToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
