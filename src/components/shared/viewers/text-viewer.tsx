"use client"

import React, { useState, useEffect } from 'react'
import { CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TextViewerProps {
  url: string
  className?: string
}

export function TextViewer({ url, className }: TextViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchText = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        setContent(text)
      } catch (err) {
        console.error('Error loading text:', err)
        setError(err instanceof Error ? err.message : 'Failed to load text')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchText()
    }
  }, [url])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Carregando arquivo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Erro ao carregar arquivo</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn("text-viewer h-full overflow-auto", className)}>
      <pre className="p-6 text-sm font-mono whitespace-pre-wrap break-words bg-muted/30 min-h-full">
        {content}
      </pre>
    </div>
  )
}
