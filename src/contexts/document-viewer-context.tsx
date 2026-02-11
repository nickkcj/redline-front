"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useDocumentViewUrl } from '@/hooks/api/use-documents'
import { useCurrentWorkspace } from '@/lib/stores/app.store'
import { toast } from 'sonner'

interface DocumentViewerState {
  isOpen: boolean
  documentId: string | null
  documentName: string | null
  directUrl: string | null
  highlightText: string | null
}

interface DocumentViewerContextType {
  // State
  isOpen: boolean
  documentId: string | null
  documentName: string | null

  // Data
  viewUrl: string | undefined
  fileName: string | null
  highlightText: string | null
  isLoading: boolean
  error: Error | null

  // Actions
  openDocument: (documentId: string, documentName: string) => void
  openDocumentByUrl: (url: string, fileName: string, highlightText?: string) => void
  closeDocument: () => void

  // Helpers
  isPdfFile: (fileName: string) => boolean
  isMarkdownFile: (fileName: string) => boolean
  isTextFile: (fileName: string) => boolean
  isDocxFile: (fileName: string) => boolean
  isImageFile: (fileName: string) => boolean
  isViewableFile: (fileName: string) => boolean
}

const DocumentViewerContext = createContext<DocumentViewerContextType | undefined>(undefined)

export function DocumentViewerProvider({ children }: { children: React.ReactNode }) {
  const currentWorkspace = useCurrentWorkspace()
  const [state, setState] = useState<DocumentViewerState>({
    isOpen: false,
    documentId: null,
    documentName: null,
    directUrl: null,
    highlightText: null,
  })

  // Query to fetch document view URL when needed (skip when using direct URL)
  const {
    data: documentData,
    isLoading: fetchLoading,
    error: fetchError
  } = useDocumentViewUrl(
    currentWorkspace?.id || '',
    state.directUrl ? '' : (state.documentId || ''),
  )

  const isLoading = state.directUrl ? false : fetchLoading
  const error = state.directUrl ? null : fetchError

  const openDocument = useCallback((documentId: string, documentName: string) => {
    if (!documentId) {
      console.error('Document ID is required')
      return
    }

    if (!currentWorkspace?.id) {
      console.error('Workspace not found. Cannot open document without workspace.')
      toast.error('Workspace não encontrado')
      return
    }

    setState({
      isOpen: true,
      documentId,
      documentName,
      directUrl: null,
      highlightText: null,
    })
  }, [currentWorkspace])

  const openDocumentByUrl = useCallback((url: string, fileName: string, highlightText?: string) => {
    if (!url) return
    setState({
      isOpen: true,
      documentId: 'direct-url',
      documentName: fileName,
      directUrl: url,
      highlightText: highlightText || null,
    })
  }, [])

  const closeDocument = useCallback(() => {
    setState({
      isOpen: false,
      documentId: null,
      documentName: null,
      directUrl: null,
      highlightText: null,
    })
  }, [])

  // Helper functions to check file types
  const isPdfFile = useCallback((fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf')
  }, [])

  const isMarkdownFile = useCallback((fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.md')
  }, [])

  const isTextFile = useCallback((fileName: string): boolean => {
    const textExtensions = ['.txt', '.log', '.csv', '.json', '.xml', '.yaml', '.yml']
    return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }, [])

  const isDocxFile = useCallback((fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.docx')
  }, [])

  const isImageFile = useCallback((fileName: string): boolean => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }, [])

  const isViewableFile = useCallback((fileName: string): boolean => {
    const viewableExtensions = [
      '.pdf',
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
      '.md',
      '.txt', '.log', '.csv', '.json', '.xml', '.yaml', '.yml',
      '.docx'
    ]
    return viewableExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }, [])

  // Handle errors from the query
  useEffect(() => {
    if (error) {
      console.error('Error fetching document URL:', error)
      toast.error('Erro ao carregar documento', {
        description: error.message || 'Não foi possível carregar o documento'
      })
    }
  }, [error])

  // Transform HTTP → HTTPS using harbor proxy to avoid Mixed Content errors
  const transformedViewUrl = React.useMemo(() => {
    // Direct URL takes priority (governance docs)
    if (state.directUrl) {
      return state.directUrl.replace(/http:\/\/35\.225\.43\.68(:\d+)?/, 'https://api.harbor.dooor.ai')
    }

    const rawUrl = documentData?.viewUrl
    if (!rawUrl) return undefined

    // Transform http://35.225.43.68[:port] → https://api.harbor.dooor.ai
    return rawUrl.replace(/http:\/\/35\.225\.43\.68(:\d+)?/, 'https://api.harbor.dooor.ai')
  }, [state.directUrl, documentData?.viewUrl])

  const value: DocumentViewerContextType = {
    // State
    isOpen: state.isOpen,
    documentId: state.documentId,
    documentName: state.documentName,

    // Data
    viewUrl: transformedViewUrl,
    fileName: documentData?.filename || state.documentName,
    highlightText: state.highlightText,
    isLoading,
    error,

    // Actions
    openDocument,
    openDocumentByUrl,
    closeDocument,

    // Helpers
    isPdfFile,
    isMarkdownFile,
    isTextFile,
    isDocxFile,
    isImageFile,
    isViewableFile,
  }

  return (
    <DocumentViewerContext.Provider value={value}>
      {children}
    </DocumentViewerContext.Provider>
  )
}

export function useDocumentViewer() {
  const context = useContext(DocumentViewerContext)
  if (context === undefined) {
    throw new Error('useDocumentViewer must be used within a DocumentViewerProvider')
  }
  return context
}
