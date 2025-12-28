/**
 * Document Hooks
 *
 * Hooks for document management (upload, list, view, delete)
 * Uses React Query for caching and automatic invalidation
 */

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useApiQuery, useApiMutation } from './use-api'
import { apiClient } from '@/lib/api/client/base.client'
import { documentService } from '@/lib/api/services/document.service'
import type {
  DocumentResponseDto,
  UploadDocumentDto,
  ListDocumentsParams,
  ViewDocumentResponseDto,
} from '@/lib/api/types/document.types'

// ============================================================================
// Document Queries
// ============================================================================

/**
 * List documents in a workspace with pagination
 * @param workspaceId - Workspace ID
 * @param params - Optional pagination params (take, skip)
 * @returns Query result with documents array
 *
 * @example
 * const { data: documents, isLoading } = useDocuments(workspaceId)
 */
export function useDocuments(workspaceId: string, params?: ListDocumentsParams) {
  return useApiQuery<DocumentResponseDto[]>(
    ['documents', workspaceId, params?.take?.toString() || '20', params?.skip?.toString() || '0'],
    () => documentService.listDocuments(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Get a specific document by ID
 * @param workspaceId - Workspace ID
 * @param documentId - Document ID
 * @returns Query result with document data
 *
 * @example
 * const { data: document } = useDocument(workspaceId, documentId)
 */
export function useDocument(workspaceId: string, documentId: string) {
  return useApiQuery<DocumentResponseDto>(
    ['document', workspaceId, documentId],
    () => documentService.getDocument(workspaceId, documentId),
    {
      enabled: !!workspaceId && !!documentId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

/**
 * Get presigned URL to view/download document
 * @param workspaceId - Workspace ID
 * @param documentId - Document ID
 * @returns Query result with view URL
 *
 * @example
 * const { data: viewUrl } = useDocumentViewUrl(workspaceId, documentId)
 */
export function useDocumentViewUrl(workspaceId: string, documentId: string) {
  return useApiQuery<ViewDocumentResponseDto>(
    ['documents', workspaceId, documentId, 'view'],
    () => documentService.getDocumentViewUrl(workspaceId, documentId),
    {
      enabled: !!workspaceId && !!documentId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

// ============================================================================
// Document Mutations
// ============================================================================

/**
 * Upload a document to the workspace
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: uploadDocument, isPending } = useUploadDocument(workspaceId)
 * uploadDocument({
 *   file: fileObject,
 *   name: "Document.pdf",
 *   description: "My document"
 * })
 */
export function useUploadDocument(workspaceId: string) {
  return useApiMutation<DocumentResponseDto, UploadDocumentDto>(
    (data) => documentService.uploadDocument(workspaceId, data),
    {
      successMessage: 'Documento enviado com sucesso!',
      invalidateKeys: [['documents', workspaceId]],
    }
  )
}

/**
 * Upload a document with progress tracking
 * @param workspaceId - Workspace ID
 * @returns Upload function with progress state
 *
 * @example
 * const { uploadWithProgress, uploadProgress, isUploading } = useUploadDocumentWithProgress(workspaceId)
 * await uploadWithProgress({
 *   file: fileObject,
 *   name: "Document.pdf"
 * }, (progress) => console.log(`${progress}%`))
 */
export function useUploadDocumentWithProgress(workspaceId: string) {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const uploadWithProgress = useCallback(
    async (
      data: UploadDocumentDto,
      onProgress?: (progress: number) => void
    ): Promise<DocumentResponseDto> => {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', data.file)
        formData.append('name', data.name)

        if (data.description) {
          formData.append('description', data.description)
        }

        if (data.tags && data.tags.length > 0) {
          data.tags.forEach((tag) => {
            formData.append('tags[]', tag)
          })
        }

        if (data.metadata) {
          formData.append('metadata', JSON.stringify(data.metadata))
        }

        const result = await apiClient.upload<DocumentResponseDto>(
          `/documents/upload/${workspaceId}`,
          formData,
          {
            onProgress: (progress) => {
              setUploadProgress(progress)
              onProgress?.(progress)
            },
          }
        )

        queryClient.invalidateQueries({ queryKey: ['documents', workspaceId] })
        return result
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [workspaceId, queryClient]
  )

  return {
    uploadWithProgress,
    uploadProgress,
    isUploading,
  }
}

/**
 * Delete a document from the workspace
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteDocument } = useDeleteDocument(workspaceId)
 * deleteDocument("document-id-123")
 */
export function useDeleteDocument(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<void, string>(
    (documentId) => documentService.deleteDocument(workspaceId, documentId),
    {
      successMessage: 'Documento excluído com sucesso!',
      onSuccess: (_data, documentId) => {
        if (documentId) {
          queryClient.invalidateQueries({ queryKey: ['documents', workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['document', workspaceId, documentId] })
          queryClient.invalidateQueries({ queryKey: ['documents', workspaceId, documentId, 'view'] })
        }
      },
    }
  )
}

/**
 * Download document as Blob (for direct download)
 * This is a regular async function, not a hook
 *
 * @example
 * const blob = await downloadDocument(workspaceId, documentId)
 * const url = URL.createObjectURL(blob)
 * window.open(url)
 */
export async function downloadDocument(workspaceId: string, documentId: string): Promise<Blob> {
  return documentService.downloadDocument(workspaceId, documentId)
}

