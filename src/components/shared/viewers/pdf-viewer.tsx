"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getDynamicHeaders } from '@/lib/utils/get-dynamic-headers'
import dynamic from 'next/dynamic'

// Dynamically import react-pdf components with no SSR
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <CircleNotch weight="bold" className="h-8 w-8 animate-spin mb-2" />
      <p className="text-sm text-muted-foreground">Carregando visualizador...</p>
    </div>
  ),
})

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
})

// Import CSS only on client side
if (typeof window !== 'undefined') {
  // @ts-expect-error -- CSS imports lack type declarations
  import('react-pdf/dist/Page/AnnotationLayer.css')
  // @ts-expect-error -- CSS imports lack type declarations
  import('react-pdf/dist/Page/TextLayer.css')
}

interface PDFViewerProps {
  url: string
  className?: string
  scale?: number
  highlightText?: string
  onLoadSuccess?: (numPages: number) => void
  onLoadStart?: () => void
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildHighlightWords(text: string): string[] {
  // Extract significant words (>3 chars) from the highlight text
  return text
    .replace(/[^\w\sàáâãéêíóôõúç]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.toLowerCase())
    // Deduplicate
    .filter((w, i, arr) => arr.indexOf(w) === i)
}

export function PDFViewer({
  url,
  className,
  scale = 1.0,
  highlightText,
  onLoadSuccess,
  onLoadStart
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagesToRender, setPagesToRender] = useState<number>(10) // Initially render only 10 pages
  const containerRef = useRef<HTMLDivElement>(null)
  const hasScrolledToHighlight = useRef(false)

  // Build highlight words from the ruleExcerpt
  const highlightWords = React.useMemo(
    () => highlightText ? buildHighlightWords(highlightText) : [],
    [highlightText]
  )

  // DOM-based highlight: after a page renders, find matching spans and apply highlight
  const applyHighlightToPage = useCallback(() => {
    if (highlightWords.length === 0 || !containerRef.current) return
    const spans = containerRef.current.querySelectorAll('.react-pdf__Page__textContent span')
    spans.forEach((span) => {
      const text = span.textContent || ''
      const lowerText = text.toLowerCase()
      if (highlightWords.some(w => lowerText.includes(w))) {
        const el = span as HTMLElement
        el.style.backgroundColor = '#fde047'
        el.style.color = '#000'
        el.style.borderRadius = '2px'
        el.style.opacity = '0.8'
        el.setAttribute('data-hl', '1')
      }
    })
  }, [highlightWords])

  // Auto-scroll to first highlight after render
  useEffect(() => {
    if (!highlightText || hasScrolledToHighlight.current || loading) return
    const timer = setTimeout(() => {
      applyHighlightToPage()
      const mark = containerRef.current?.querySelector('[data-hl="1"]')
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
        hasScrolledToHighlight.current = true
      }
    }, 2000) // Wait for pages to render
    return () => clearTimeout(timer)
  }, [highlightText, loading, pagesToRender, applyHighlightToPage])

  // Reset scroll flag when highlight text changes
  useEffect(() => {
    hasScrolledToHighlight.current = false
  }, [highlightText])

  // Configure PDF.js worker only on client side
  useEffect(() => {
    const initPdfWorker = async () => {
      if (typeof window !== 'undefined') {
        const { pdfjs } = await import('react-pdf')
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      }
    }
    initPdfWorker()
  }, [])

  // Handler to load more pages
  const loadMorePages = useCallback(() => {
    setPagesToRender(prev => Math.min(prev + 10, numPages))
  }, [numPages])

  // Create a memoized file object for react-pdf
  const fileConfig = React.useMemo(() => {
    // Check if URL is direct Pocketbase URL (via harbor proxy or direct)
    // vs scaffold-backend proxy URL (needs auth headers)
    const isDirectPocketbaseUrl = url?.includes('api.harbor.dooor.ai') ||
                                  url?.includes('35.225.43.68') ||
                                  url?.includes('databases/')

    console.log('📄 [PDF-VIEWER] Creating fileConfig:', {
      url,
      urlLength: url?.length,
      isDirectPocketbaseUrl,
      timestamp: new Date().toISOString()
    })

    // Custom fetch wrapper to log all PDF requests
    const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

      const rangeHeader = init?.headers instanceof Headers
        ? init.headers.get('Range') || init.headers.get('range')
        : init?.headers
          ? (init.headers as Record<string, string>)['Range'] || (init.headers as Record<string, string>)['range']
          : undefined

      console.log('🌐 [PDF-FETCH] Request starting:', {
        url: requestUrl,
        method: init?.method || 'GET',
        headers: init?.headers,
        rangeHeader: rangeHeader || 'none',
        timestamp: new Date().toISOString()
      })

      try {
        const response = await fetch(input, init)

        console.log('✅ [PDF-FETCH] Response received:', {
          url: requestUrl,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: {
            'content-length': response.headers.get('content-length'),
            'content-range': response.headers.get('content-range'),
            'content-type': response.headers.get('content-type'),
            'accept-ranges': response.headers.get('accept-ranges'),
          },
          timestamp: new Date().toISOString()
        })

        if (!response.ok) {
          console.error('❌ [PDF-FETCH] Response not OK:', {
            url: requestUrl,
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          })
        }

        return response
      } catch (error) {
        console.error('❌ [PDF-FETCH] Fetch error:', {
          url: requestUrl,
          error: error instanceof Error ? error.message : String(error),
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorStack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        throw error
      }
    }

    if (isDirectPocketbaseUrl) {
      // Direct Pocketbase URL (via harbor HTTPS proxy or direct) - no headers needed (presigned URL)
      // react-pdf will automatically use Range Requests
      console.log('📄 [PDF-VIEWER] Using direct Pocketbase URL config (no auth headers)')
      return {
        url: url,
        withCredentials: false, // Allow Range requests
        httpHeaders: {}, // No auth headers for presigned URL
        customFetch, // Custom fetch to log requests
      }
    }

    // Proxy URL - needs auth headers
    const headers = getDynamicHeaders()
    const httpHeaders = {
      'X-Parse-Application-Id': headers['X-Parse-Application-Id'],
      'X-API-Key': headers['X-API-Key'],
      ...(headers['x-parse-session-token'] && { 'x-parse-session-token': headers['x-parse-session-token'] }),
    }

    console.log('📄 [PDF-VIEWER] Using proxy URL config with auth headers:', {
      hasSessionToken: !!headers['x-parse-session-token'],
      hasApiKey: !!headers['X-API-Key'],
    })

    return {
      url: url,
      httpHeaders: httpHeaders,
      withCredentials: false, // Allow Range requests
      customFetch, // Custom fetch to log requests
    }
  }, [url])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ [PDF-VIEWER] Document loaded successfully:', {
      numPages,
      url,
      timestamp: new Date().toISOString()
    })
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    onLoadSuccess?.(numPages)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ [PDF-VIEWER] Document load error:', {
      error: error.message,
      errorName: error.name,
      errorStack: error.stack,
      url,
      timestamp: new Date().toISOString()
    })

    setLoading(false)
    const errorMessage = error.message || 'Erro ao carregar o PDF'

    // Check for CORS errors when using direct Pocketbase URL
    if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
      setError('Erro de CORS ao carregar PDF. Usando proxy alternativo...')
      console.error('❌ [PDF-VIEWER] CORS error with direct URL, may need to use proxy:', {
        error,
        url,
        timestamp: new Date().toISOString()
      })
    } else {
      setError(`Erro ao carregar o PDF: ${errorMessage}`)
    }
  }

  // Call onLoadStart when starting to load
  useEffect(() => {
    if (url) {
      console.log('🚀 [PDF-VIEWER] Starting to load document:', {
        url,
        urlLength: url.length,
        timestamp: new Date().toISOString()
      })
      onLoadStart?.()
    }
  }, [url, onLoadStart])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <div className="text-destructive mb-4 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar PDF</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded max-w-md break-all">
          URL: {url?.substring(0, 100)}...
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* PDF Document - continuous scroll */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900" ref={containerRef}>
        <div className="flex justify-center py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <CircleNotch weight="bold" className="h-8 w-8 animate-spin mb-2" />
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
                    onRenderSuccess={() => {
                      console.log(`📄 [PDF-VIEWER] Page ${index + 1}/${numPages} rendered successfully`)
                      if (highlightWords.length > 0) {
                        setTimeout(applyHighlightToPage, 300)
                      }
                    }}
                    onRenderError={(error) => {
                      console.error(`❌ [PDF-VIEWER] Page ${index + 1}/${numPages} render error:`, {
                        error: error instanceof Error ? error.message : String(error),
                        timestamp: new Date().toISOString()
                      })
                    }}
                  />
                ))}

                {/* "Load more" button when there are more pages to render */}
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

                {/* Message when all pages have been loaded */}
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
