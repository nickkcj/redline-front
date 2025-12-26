import { useApiQuery, useApiMutation } from './use-api';
import { documentService, type DocumentResponseDto, type UploadDocumentDto, type ListDocumentsParams } from '@/lib/api/services/document.service';

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
  );
}

export function useDocument(workspaceId: string, documentId: string) {
  return useApiQuery<DocumentResponseDto>(
    ['document', workspaceId, documentId],
    () => documentService.getDocument(workspaceId, documentId),
    {
      enabled: !!workspaceId && !!documentId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

export function useUploadDocument(workspaceId: string) {
  return useApiMutation<DocumentResponseDto, UploadDocumentDto>(
    (data) => documentService.uploadDocument(workspaceId, data),
    {
      successMessage: 'Documento enviado com sucesso!',
      invalidateKeys: [['documents', workspaceId]],
    }
  );
}

export function useDeleteDocument(workspaceId: string) {
  return useApiMutation<void, string>(
    (documentId) => documentService.deleteDocument(workspaceId, documentId),
    {
      successMessage: 'Documento excluído com sucesso!',
      invalidateKeys: [['documents', workspaceId]],
    }
  );
}

