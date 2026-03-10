"use client"

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  url: string
  className?: string
}

export function MarkdownViewer({ url, className }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkdown = async () => {
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
        console.error('Error loading markdown:', err)
        setError(err instanceof Error ? err.message : 'Failed to load markdown')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchMarkdown()
    }
  }, [url])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CircleNotch className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Carregando markdown...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <WarningCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Erro ao carregar markdown</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn("markdown-viewer h-full overflow-auto p-6", className)}>
      <div
        className="prose prose-sm dark:prose-invert max-w-none
        prose-headings:text-foreground prose-headings:font-semibold
        prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
        prose-li:text-foreground prose-li:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-blockquote:border-l-border prose-blockquote:border-l-4 prose-blockquote:pl-4
        prose-blockquote:text-muted-foreground prose-blockquote:italic
        prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline hover:prose-a:underline
        prose-hr:border-border prose-hr:my-8
        prose-ul:space-y-2 prose-ol:space-y-2
        prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
        prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
        prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-8 text-foreground">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
            ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-2 mb-4">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-l-border pl-4 italic text-muted-foreground my-4">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isInlineCode = !className;
              if (isInlineCode) {
                return <code className="bg-muted px-1 rounded text-sm">{children}</code>;
              }
              return <code className={className}>{children}</code>;
            },
            pre: ({ children }) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
