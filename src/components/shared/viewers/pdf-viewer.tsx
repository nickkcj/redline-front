"use client"

import React, { useState } from 'react'
import { Loader2, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFViewerProps {
  url: string
  className?: string
  scale?: number
  onLoadSuccess?: (numPages: number) => void
}

export function PDFViewer({
  url,
  className,
  onLoadSuccess
}: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = () => {
    setLoading(false)
    setError(null)
    onLoadSuccess?.(1) // PDF loaded successfully
  }

  const handleError = () => {
    setLoading(false)
    setError('Erro ao carregar o PDF')
  }

  const openInNewTab = () => {
    window.open(url, '_blank')
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-destructive mb-4 text-4xl">⚠️</div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={openInNewTab}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir em nova aba
        </button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 bg-gray-100 dark:bg-gray-900">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Carregando PDF...</p>
          </div>
        )}

        <iframe
          src={url}
          className={cn("w-full h-full border-0", loading ? "hidden" : "block")}
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Viewer"
        />

        {!loading && !error && (
          <div className="absolute top-4 right-4">
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-3 py-2 bg-primary/90 text-primary-foreground rounded-lg hover:bg-primary transition-colors text-sm"
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
              Expandir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
