import { useApiQuery, useApiMutation } from './use-api'
import { chatService } from '@/lib/api/services/chat.service'
import {
  ChatResponseDto,
  ListChatsResponseDto,
  CreateChatDto,
  SendMessageDto,
  ChatMessageResponseDto,
  ChatMessagesResponseDto,
  UpdateChatStatusDto,
  ListChatsDto
} from '@/types/chat'

// Lista todos os chats do workspace
export function useChats(workspaceId: string, params?: ListChatsDto) {
  return useApiQuery<ListChatsResponseDto>(
    ['chats', workspaceId, params?.page?.toString() || '1', params?.limit?.toString() || '20'],
    () => chatService.listChats(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// Busca um chat específico com histórico de mensagens
export function useChat(workspaceId: string, chatId: string) {
  return useApiQuery<ChatResponseDto>(
    ['chat', workspaceId, chatId],
    () => chatService.getChat(workspaceId, chatId),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  )
}

// Busca mensagens de um chat com paginação
export function useChatMessages(workspaceId: string, chatId: string, params?: ListChatsDto) {
  return useApiQuery<ChatMessagesResponseDto>(
    ['chat-messages', workspaceId, chatId, params?.page?.toString() || '1', params?.limit?.toString() || '20'],
    () => chatService.getChatMessages(workspaceId, chatId, params),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// Cria um novo chat
export function useCreateChat(workspaceId: string) {
  return useApiMutation<ChatResponseDto, CreateChatDto>(
    (data) => {
      console.log('useCreateChat called with:', { workspaceId, data })
      return chatService.createChat(workspaceId, data)
    },
    {
      successMessage: 'Chat criado com sucesso!',
      invalidateKeys: [['chats', workspaceId]],
    }
  )
}

// Envia uma mensagem para o chat
export function useSendMessage(workspaceId: string, chatId: string) {
  return useApiMutation<ChatMessageResponseDto, SendMessageDto>(
    (data) => {
      console.log('useSendMessage called with:', { workspaceId, chatId, data })
      return chatService.sendMessage(workspaceId, chatId, data)
    },
    {
      showSuccessToast: false, // Não mostrar toast para envio de mensagem
      invalidateKeys: [
        ['chat', workspaceId, chatId],
        ['chat-messages', workspaceId, chatId],
        ['chats', workspaceId]
      ],
    }
  )
}

// Atualiza o status do chat (ativo/inativo)
export function useUpdateChatStatus(workspaceId: string, chatId: string) {
  return useApiMutation<ChatResponseDto, UpdateChatStatusDto>(
    (data) => chatService.updateChatStatus(workspaceId, chatId, data),
    {
      successMessage: 'Status do chat atualizado!',
      invalidateKeys: [
        ['chat', workspaceId, chatId],
        ['chats', workspaceId]
      ],
    }
  )
}

// Renomeia um chat
export function useRenameChat(workspaceId: string) {
  return useApiMutation<ChatResponseDto, { chatId: string; title: string }>(
    ({ chatId, title }) => chatService.renameChat(workspaceId, chatId, title),
    {
      successMessage: 'Chat renomeado com sucesso!',
      invalidateKeys: [
        ['chat', workspaceId],
        ['chats', workspaceId]
      ],
    }
  )
}

// Deleta um chat
export function useDeleteChat(workspaceId: string) {
  return useApiMutation<{ success: boolean }, string>(
    (chatId) => chatService.deleteChat(workspaceId, chatId),
    {
      successMessage: 'Chat deletado com sucesso!',
      invalidateKeys: [['chats', workspaceId]],
    }
  )
}