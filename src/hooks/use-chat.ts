import { useApiQuery, useApiMutation } from './use-api'
import { tokenStore } from '@/lib/auth/stores/auth.store'
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

// Utility function for API calls using the same pattern as auth and users
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
  const accessToken = tokenStore.getAccessToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Lista todos os chats do workspace
export function useChats(workspaceId: string, params?: ListChatsDto) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const queryString = queryParams.toString()
  const endpoint = `/chats/${workspaceId}${queryString ? `?${queryString}` : ''}`

  return useApiQuery<ListChatsResponseDto>(
    ['chats', workspaceId, params?.page?.toString() || '1', params?.limit?.toString() || '20'],
    () => apiCall<ListChatsResponseDto>(endpoint),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

// Busca um chat específico com histórico de mensagens
export function useChat(workspaceId: string, chatId: string) {
  return useApiQuery<ChatResponseDto>(
    ['chat', workspaceId, chatId],
    () => apiCall<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  )
}

// Busca mensagens de um chat com paginação
export function useChatMessages(workspaceId: string, chatId: string, params?: ListChatsDto) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const queryString = queryParams.toString()
  const endpoint = `/chats/${workspaceId}/${chatId}/messages${queryString ? `?${queryString}` : ''}`

  return useApiQuery<ChatMessagesResponseDto>(
    ['chat-messages', workspaceId, chatId, params?.page?.toString() || '1', params?.limit?.toString() || '20'],
    () => apiCall<ChatMessagesResponseDto>(endpoint),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 30, // 30 seconds
    }
  )
}

// Cria um novo chat
export function useCreateChat(workspaceId: string) {
  return useApiMutation<ChatResponseDto, CreateChatDto>(
    (data) => {
      console.log('useCreateChat called with:', { workspaceId, data })
      return apiCall<ChatResponseDto>(`/chats/${workspaceId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
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
      return apiCall<ChatMessageResponseDto>(`/chats/${workspaceId}/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
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
    (data) => apiCall<ChatResponseDto>(`/chats/${workspaceId}/${chatId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
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
    ({ chatId, title }) => apiCall<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
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
    (chatId) => apiCall<{ success: boolean }>(`/chats/${workspaceId}/${chatId}`, {
      method: 'DELETE',
    }),
    {
      successMessage: 'Chat deletado com sucesso!',
      invalidateKeys: [['chats', workspaceId]],
    }
  )
}