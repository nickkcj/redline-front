"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface PDFViewerProps {
  url: string
  className?: string
  scale?: number
  onLoadSuccess?: (numPages: number) => void
}

export function PDFViewer({
  url,
  className,
  scale = 1.0,
  onLoadSuccess
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagesToRender, setPagesToRender] = useState<number>(10)

  // Configure PDF.js worker only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }
  }, [])

  const loadMorePages = useCallback(() => {
    setPagesToRender(prev => Math.min(prev + 10, numPages))
  }, [numPages])

  // Presigned URL configuration - no auth headers needed
  const fileConfig = React.useMemo(() => {
    return {
      url: url,
      withCredentials: false, // Allow Range requests
    }
  }, [url])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    onLoadSuccess?.(numPages)
  }

  const onDocumentLoadError = (error: Error) => {
    setLoading(false)
    const errorMessage = error.message || 'Erro ao carregar o PDF'

    if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
      setError('Erro de CORS ao carregar PDF')
    } else {
      setError(`Erro ao carregar o PDF: ${errorMessage}`)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-destructive mb-2">⚠️</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
        <div className="flex justify-center py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Carregando PDF...</p>
            </div>
          )}

          <Document
            file={fileConfig}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            className="max-w-full"
          >
            {numPages > 0 && (
              <div className="flex flex-col gap-4">
                {Array.from(new Array(Math.min(pagesToRender, numPages)), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                    className="shadow-lg border border-gray-300 dark:border-gray-600"
                    loading=""
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                  />
                ))}

                {/* Load more button */}
                {pagesToRender < numPages && (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {pagesToRender} de {numPages} páginas
                    </p>
                    <button
                      onClick={loadMorePages}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Carregar mais 10 páginas
                    </button>
                  </div>
                )}

                {/* All pages loaded message */}
                {pagesToRender >= numPages && numPages > 10 && (
                  <div className="flex justify-center py-6">
                    <p className="text-sm text-muted-foreground">
                      ✓ Todas as {numPages} páginas foram carregadas
                    </p>
                  </div>
                )}
              </div>
            )}
          </Document>
        </div>
      </div>
    </div>
  )
}
