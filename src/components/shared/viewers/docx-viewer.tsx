"use client"

import React, { useState, useEffect, useRef } from 'react'
import { CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { renderAsync } from 'docx-preview'

interface DocxViewerProps {
  url: string
  className?: string
}

export function DocxViewer({ url, className }: DocxViewerProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDocx = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        if (containerRef.current) {
          await renderAsync(arrayBuffer, containerRef.current, undefined, {
            className: 'docx-wrapper',
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: true,
            trimXmlDeclaration: true,
            useBase64URL: false
          })
        }
      } catch (err) {
        console.error('Error loading DOCX:', err)
        setError(err instanceof Error ? err.message : 'Failed to load DOCX')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchDocx()
    }
  }, [url])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CircleNotch className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Carregando documento DOCX...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <WarningCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Erro ao carregar documento DOCX</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn("docx-viewer h-full overflow-x-hidden overflow-y-auto", className)}>
      <div
        ref={containerRef}
        className="bg-white min-h-full"
        style={{
          fontFamily: 'Times, "Times New Roman", serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#000',
          transform: 'scale(1)',
          transformOrigin: 'top center',
          overflow: 'hidden',
          maxWidth: 'min(800px, 100%)',
          margin: '0 auto',
          width: '100%'
        }}
      />
    </div>
  )
}
