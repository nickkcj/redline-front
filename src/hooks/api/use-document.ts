// ============================================================
// USE DOCUMENT - Hooks para Documents
// ============================================================

import { useApiQuery, useApiMutation } from './use-api'
import { DocumentService } from '@/lib/api/services'
import type {
  UploadDocumentDto,
  QueryDocumentDto,
} from '@/lib/api/types'

/**
 * Lista documentos do workspace
 */
export function useDocuments(workspaceId: string, query?: QueryDocumentDto) {
  return useApiQuery(
    ['documents', workspaceId, query],
    () => DocumentService.list(workspaceId, query),
    {
      enabled: !!workspaceId,
      staleTime: 60000, // 1 minuto
    }
  )
}

/**
 * Busca detalhes do documento
 */
export function useDocument(documentId: string, workspaceId: string) {
  return useApiQuery(
    ['documents', workspaceId, documentId],
    () => DocumentService.getById(documentId, workspaceId),
    {
      enabled: !!documentId && !!workspaceId,
      staleTime: 60000, // 1 minuto
    }
  )
}

/**
 * Retorna URL presigned para visualizar documento
 */
export function useDocumentViewUrl(documentId: string, workspaceId: string) {
  return useApiQuery(
    ['documents', workspaceId, documentId, 'view'],
    () => DocumentService.getViewUrl(documentId, workspaceId),
    {
      enabled: !!documentId && !!workspaceId,
      staleTime: 300000, // 5 minutos
    }
  )
}

/**
 * Upload de documento
 */
export function useUploadDocument(workspaceId: string) {
  return useApiMutation(
    ({ file, data, onProgress }: {
      file: File
      data: UploadDocumentDto
      onProgress?: (progress: number) => void
    }) => DocumentService.upload(workspaceId, file, data, onProgress),
    {
      successMessage: 'Document uploaded successfully!',
      invalidateKeys: [
        ['documents', workspaceId],
      ],
    }
  )
}

/**
 * Remove documento
 */
export function useDeleteDocument(workspaceId: string) {
  return useApiMutation(
    (documentId: string) => DocumentService.delete(documentId, workspaceId),
    {
      successMessage: 'Document deleted successfully!',
      invalidateKeys: [
        ['documents', workspaceId],
      ],
    }
  )
}

/**
 * Download de documento (retorna Blob)
 */
export async function downloadDocument(documentId: string, workspaceId: string) {
  return DocumentService.download(documentId, workspaceId)
}
