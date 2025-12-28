"use client"

import React, { useState, useEffect } from "react"
import { Loader2, AlertCircle, X, Download, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PDFViewer } from "./pdf-viewer"
import { MarkdownViewer } from "./markdown-viewer"
import { ImageViewer } from "./image-viewer"
import { TextViewer } from "./text-viewer"
import { DocxViewer } from "./docx-viewer"
import { useDocumentViewer } from "@/contexts/document-viewer-context"

export function UnifiedDocumentViewer() {
  const {
    isOpen,
    documentId,
    documentName,
    viewUrl,
    fileName,
    isLoading,
    error,
    closeDocument,
    isPdfFile,
    isMarkdownFile,
    isTextFile,
    isDocxFile,
    isImageFile,
  } = useDocumentViewer()

  if (!isOpen) return null

  const handleDownload = () => {
    if (viewUrl) {
      window.open(viewUrl, "_blank")
    }
  }

  const renderViewer = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Carregando documento...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar documento</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "Não foi possível carregar o documento"}
          </p>
          <Button onClick={closeDocument}>Fechar</Button>
        </div>
      )
    }

    if (!viewUrl || !fileName) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Preparando documento...</p>
        </div>
      )
    }

    // Render based on file type
    if (isPdfFile(fileName)) {
      return <PDFViewer url={viewUrl} />
    }

    if (isMarkdownFile(fileName)) {
      return <MarkdownViewer url={viewUrl} />
    }

    if (isImageFile(fileName)) {
      return <ImageViewer url={viewUrl} fileName={fileName} />
    }

    if (isTextFile(fileName)) {
      return <TextViewer url={viewUrl} />
    }

    if (isDocxFile(fileName)) {
      return <DocxViewer url={viewUrl} />
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tipo de arquivo não suportado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este tipo de arquivo não pode ser visualizado diretamente.
        </p>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Baixar arquivo
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDocument()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate flex-1 mr-4">
              {fileName || documentName || "Visualizando documento"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {viewUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={closeDocument}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {renderViewer()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
