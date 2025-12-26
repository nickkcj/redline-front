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

export function useMarkDocument(workspaceId: string) {
  return useApiMutation<
    { success: boolean; message: string },
    { chatId: string; documentId: string }
  >(
    ({ chatId, documentId }) =>
      chatService.markDocumentInChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento marcado com sucesso!',
      invalidateKeys: (vars) => [
        ['marked-documents', workspaceId, vars.chatId],
        ['chat', workspaceId, vars.chatId],
      ],
    }
  );
}

export function useUnmarkDocument(workspaceId: string) {
  return useApiMutation<
    { success: boolean; message: string },
    { chatId: string; documentId: string }
  >(
    ({ chatId, documentId }) =>
      chatService.unmarkDocumentFromChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento desmarcado com sucesso!',
      invalidateKeys: (vars) => [
        ['marked-documents', workspaceId, vars.chatId],
        ['chat', workspaceId, vars.chatId],
      ],
    }
  );
}


