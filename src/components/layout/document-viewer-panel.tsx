"use client"

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MagnifyingGlassPlus, MagnifyingGlassMinus, FileText, X, WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { MarkdownViewer } from '@/components/shared/viewers/markdown-viewer'
import { TextViewer } from '@/components/shared/viewers/text-viewer'
import { ImageViewer } from '@/components/shared/viewers/image-viewer'
import { DocxViewer } from '@/components/shared/viewers/docx-viewer'
import { useDocumentViewer } from '@/contexts/document-viewer-context'
import { cn } from '@/lib/utils'

// Import PDFViewer dynamically to avoid SSR issues with PDF libraries
const PDFViewer = dynamic(
  () => import('@/components/shared/viewers/pdf-viewer').then(mod => ({ default: mod.PDFViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <CircleNotch weight="bold" className="h-8 w-8 animate-spin" />
      </div>
    )
  }
)

interface DocumentViewerPanelProps {
  className?: string
}

export function DocumentViewerPanel({ className }: DocumentViewerPanelProps) {
  const {
    documentId,
    documentName,
    viewUrl,
    isLoading,
    error,
    isPdfFile,
    isMarkdownFile,
    isTextFile,
    isDocxFile,
    isImageFile,
    isViewableFile,
    closeDocument,
  } = useDocumentViewer()

  // State for zoom and pages (for PDFs)
  const [scale, setScale] = useState<number>(1.0)
  const [numPages, setNumPages] = useState<number>(0)
  const [pdfLoading, setPdfLoading] = useState<boolean>(true)

  const zoomIn = useCallback(() => {
    if (scale < 3.0) {
      setScale(scale + 0.25)
    }
  }, [scale])

  const zoomOut = useCallback(() => {
    if (scale > 0.5) {
      setScale(scale - 0.25)
    }
  }, [scale])

  const handlePdfLoad = useCallback((pages: number) => {
    setNumPages(pages)
    setPdfLoading(false)
  }, [])

  // Don't render if no document is selected
  if (!documentId || !documentName) {
    return null
  }

  return (
    <div className={cn("flex flex-col h-screen bg-background border-l", className)} style={{ width: '50%' }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <FileText weight="bold" className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate">
                {documentName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isPdfFile(documentName)
                  ? (pdfLoading ? 'Carregando...' : `${numPages} páginas`)
                  : isMarkdownFile(documentName)
                    ? 'Arquivo Markdown'
                    : isTextFile(documentName)
                      ? 'Arquivo de Texto'
                      : isDocxFile(documentName)
                        ? 'Documento Word'
                        : isImageFile(documentName)
                          ? 'Imagem'
                          : 'Visualização de documento'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPdfFile(documentName) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5 || isLoading}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <span className="text-sm font-mono min-w-[50px] text-center">
                  {Math.round(scale * 100)}%
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3.0 || isLoading}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={closeDocument}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Carregando documento...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Erro ao carregar documento</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Não foi possível carregar o documento. Tente novamente.'}
            </p>
            <Button onClick={closeDocument} variant="outline">
              Fechar
            </Button>
          </div>
        )}

        {!isLoading && !error && viewUrl && (
          <>
            {isPdfFile(documentName) ? (
              <PDFViewer
                url={viewUrl}
                className="h-full"
                scale={scale}
                onLoadSuccess={handlePdfLoad}
              />
            ) : isMarkdownFile(documentName) ? (
              <MarkdownViewer url={viewUrl} className="h-full" />
            ) : isTextFile(documentName) ? (
              <TextViewer url={viewUrl} className="h-full" />
            ) : isDocxFile(documentName) ? (
              <DocxViewer url={viewUrl} className="h-full" />
            ) : isImageFile(documentName) ? (
              <ImageViewer url={viewUrl} fileName={documentName} />
            ) : isViewableFile(documentName) ? (
              // Fallback for other viewable files
              <ImageViewer url={viewUrl} fileName={documentName} />
            ) : (
              // Fallback for non-viewable files
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Visualização não disponível</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Este tipo de arquivo não pode ser visualizado diretamente.
                </p>
                <Button onClick={closeDocument} variant="outline">
                  Fechar
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
