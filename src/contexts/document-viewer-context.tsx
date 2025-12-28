"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useDocumentViewUrl } from '@/hooks/api/use-documents'
import { useCurrentWorkspace } from '@/lib/stores/app.store'
import { toast } from 'sonner'

interface DocumentViewerState {
  isOpen: boolean
  documentId: string | null
  documentName: string | null
}

interface DocumentViewerContextType {
  // State
  isOpen: boolean
  documentId: string | null
  documentName: string | null

  // Data
  viewUrl: string | undefined
  fileName: string | null
  isLoading: boolean
  error: Error | null

  // Actions
  openDocument: (documentId: string, documentName: string) => void
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
  })

  // Query to fetch document view URL when needed
  const {
    data: documentData,
    isLoading,
    error
  } = useDocumentViewUrl(
    currentWorkspace?.id || '',
    state.documentId || '',
  )

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
    })
  }, [currentWorkspace])

  const closeDocument = useCallback(() => {
    setState({
      isOpen: false,
      documentId: null,
      documentName: null,
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

  const value: DocumentViewerContextType = {
    // State
    isOpen: state.isOpen,
    documentId: state.documentId,
    documentName: state.documentName,

    // Data
    viewUrl: documentData?.viewUrl,
    fileName: documentData?.filename || state.documentName,
    isLoading,
    error,

    // Actions
    openDocument,
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
