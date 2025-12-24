import { useApiQuery, useApiMutation } from './use-api';
import { chatService } from '@/lib/api/services/chat.service';

export function useMarkedDocuments(workspaceId: string, chatId: string) {
  return useApiQuery<any[]>(
    ['marked-documents', workspaceId, chatId],
    () => chatService.getMarkedDocuments(workspaceId, chatId),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  );
}

export function useMarkDocument(workspaceId: string, chatId: string) {
  return useApiMutation<{ success: boolean; message: string }, string>(
    (documentId) => chatService.markDocumentInChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento marcado com sucesso!',
      invalidateKeys: [
        ['marked-documents', workspaceId, chatId],
        ['chat', workspaceId, chatId],
      ],
    }
  );
}

export function useUnmarkDocument(workspaceId: string, chatId: string) {
  return useApiMutation<{ success: boolean; message: string }, string>(
    (documentId) => chatService.unmarkDocumentFromChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento desmarcado com sucesso!',
      invalidateKeys: [
        ['marked-documents', workspaceId, chatId],
        ['chat', workspaceId, chatId],
      ],
    }
  );
}

