/**
 * Chat Hooks
 *
 * Hooks for chat management (list, create, send messages, etc)
 * Uses React Query for caching and automatic invalidation
 */

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useApiQuery, useApiMutation } from './use-api'
import { chatService } from '@/lib/api/services/chat.service'
import { parseSSEStream } from '@/lib/utils/streaming.utils'
import type {
  ChatResponseDto,
  ListChatsResponseDto,
  CreateChatDto,
  SendMessageDto,
  ChatMessageResponseDto,
  ChatMessagesResponseDto,
  UpdateChatStatusDto,
  ListChatsDto,
} from '@/lib/api/types/chat.types'

// ============================================================================
// Chat Queries
// ============================================================================

/**
 * List all chats in a workspace with pagination
 * @param workspaceId - Workspace ID
 * @param params - Optional pagination params
 * @returns Query result with chats list
 *
 * @example
 * const { data: chats, isLoading } = useChats(workspaceId)
 */
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

/**
 * Get a specific chat with its message history
 * @param workspaceId - Workspace ID
 * @param chatId - Chat ID
 * @returns Query result with chat data and messages
 *
 * @example
 * const { data: chat } = useChat(workspaceId, chatId)
 */
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

/**
 * Get chat messages with pagination
 * @param workspaceId - Workspace ID
 * @param chatId - Chat ID
 * @param params - Optional pagination params or query options
 * @returns Query result with messages list
 *
 * @example
 * const { data: messages } = useChatMessages(workspaceId, chatId)
 * const { data: messages } = useChatMessages(workspaceId, chatId, { enabled: !!chatId })
 */
export function useChatMessages(
  workspaceId: string,
  chatId: string,
  params?: ListChatsDto | { enabled?: boolean; page?: number; limit?: number }
) {
  // Separate pagination params from query options
  const queryOptions = typeof params === 'object' && 'enabled' in params ? params : undefined
  const paginationParams = typeof params === 'object' && !('enabled' in params) ? params : undefined

  return useApiQuery<ChatMessagesResponseDto>(
    ['chat-messages', workspaceId, chatId, paginationParams?.page?.toString() || '1', paginationParams?.limit?.toString() || '20'],
    () => chatService.getChatMessages(workspaceId, chatId, paginationParams),
    {
      enabled: queryOptions?.enabled !== undefined ? queryOptions.enabled : (!!workspaceId && !!chatId),
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Get marked documents in a chat
 * @param workspaceId - Workspace ID
 * @param chatId - Chat ID
 * @returns Query result with marked documents array
 *
 * @example
 * const { data: markedDocs } = useMarkedDocuments(workspaceId, chatId)
 */
export function useMarkedDocuments(workspaceId: string, chatId: string) {
  return useApiQuery<any[]>(
    ['marked-documents', workspaceId, chatId],
    () => chatService.getMarkedDocuments(workspaceId, chatId),
    {
      enabled: !!workspaceId && !!chatId,
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Chat Mutations
// ============================================================================

/**
 * Create a new chat in the workspace
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: createChat, isPending } = useCreateChat(workspaceId)
 * createChat({ title: "New Chat" })
 */
export function useCreateChat(workspaceId: string) {
  return useApiMutation<ChatResponseDto, CreateChatDto>(
    (data) => chatService.createChat(workspaceId, data),
    {
      successMessage: 'Chat criado com sucesso!',
      invalidateKeys: [['chats', workspaceId]],
    }
  )
}

/**
 * Send a message to a chat
 * @param workspaceId - Workspace ID
 * @param chatId - Chat ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: sendMessage } = useSendMessage(workspaceId, chatId)
 * sendMessage({ content: "Hello!", documentIds: [] })
 */
export function useSendMessage(workspaceId: string, chatId: string) {
  return useApiMutation<ChatMessageResponseDto, SendMessageDto>(
    (data) => chatService.sendMessage(workspaceId, chatId, data),
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

/**
 * Update chat status (active/inactive)
 * @param workspaceId - Workspace ID
 * @param chatId - Chat ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateStatus } = useUpdateChatStatus(workspaceId, chatId)
 * updateStatus({ status: 'active' })
 */
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

/**
 * Rename a chat
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: renameChat } = useRenameChat(workspaceId)
 * renameChat({ chatId: "123", title: "New Title" })
 */
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

/**
 * Delete a chat
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteChat } = useDeleteChat(workspaceId)
 * deleteChat("chat-id-123")
 */
export function useDeleteChat(workspaceId: string) {
  return useApiMutation<{ success: boolean }, string>(
    (chatId) => chatService.deleteChat(workspaceId, chatId),
    {
      successMessage: 'Chat deletado com sucesso!',
      invalidateKeys: [['chats', workspaceId]],
    }
  )
}

/**
 * Mark a document in a chat
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: markDocument } = useMarkDocument(workspaceId)
 * markDocument({ chatId: "123", documentId: "doc-456" })
 */
export function useMarkDocument(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<{ success: boolean; message: string }, { chatId: string; documentId: string }>(
    ({ chatId, documentId }) => chatService.markDocumentInChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento marcado no chat!',
      onSuccess: (_data, variables) => {
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ['marked-documents', workspaceId, variables.chatId] })
          queryClient.invalidateQueries({ queryKey: ['chat', workspaceId, variables.chatId] })
        }
      },
    }
  )
}

/**
 * Unmark a document from a chat
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: unmarkDocument } = useUnmarkDocument(workspaceId)
 * unmarkDocument({ chatId: "123", documentId: "doc-456" })
 */
export function useUnmarkDocument(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<{ success: boolean; message: string }, { chatId: string; documentId: string }>(
    ({ chatId, documentId }) => chatService.unmarkDocumentFromChat(workspaceId, chatId, documentId),
    {
      successMessage: 'Documento desmarcado do chat!',
      onSuccess: (_data, variables) => {
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ['marked-documents', workspaceId, variables.chatId] })
          queryClient.invalidateQueries({ queryKey: ['chat', workspaceId, variables.chatId] })
        }
      },
    }
  )
}

/**
 * Hook for streaming chat responses
 * @param options - Configuration options for streaming
 * @returns Streaming state and control functions
 *
 * @example
 * const { isStreaming, streamingContent, startStream, clearStreamingContent } = useStreamChat({
 *   onStreamEnd: () => console.log('Stream finished'),
 *   onError: (error) => console.error(error)
 * })
 *
 * startStream(workspaceId, chatId, "Hello!")
 */
export function useStreamChat(options?: {
  onStreamEnd?: () => void
  onError?: (error: Error) => void
  onContent?: (content: string) => void
}) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const startStream = useCallback(
    async (workspaceId: string, chatId: string, content: string, useWebSearch?: boolean) => {
      setIsStreaming(true)
      setStreamingContent('')

      try {
        const stream = await chatService.streamChat(workspaceId, chatId, content, useWebSearch)
        let accumulatedContent = ''

        await parseSSEStream(stream, {
          onContent: (chunk: string) => {
            accumulatedContent += chunk
            setStreamingContent(accumulatedContent)
            options?.onContent?.(accumulatedContent)
          },
          onDone: () => {
            setIsStreaming(false)
            options?.onStreamEnd?.()
          },
          onParseError: (line, error) => {
            console.debug('SSE parse error:', line, error)
          },
        })
      } catch (error) {
        setIsStreaming(false)
        const errorMessage = error instanceof Error ? error : new Error('Erro ao processar stream')
        options?.onError?.(errorMessage)
        throw error
      }
    },
    [options]
  )

  const clearStreamingContent = useCallback(() => {
    setStreamingContent('')
  }, [])

  return {
    isStreaming,
    streamingContent,
    startStream,
    clearStreamingContent,
  }
}