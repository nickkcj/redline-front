import { apiClient } from '@/lib/api/client/base.client'
import { tokenStore } from '@/lib/stores/token.store'
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

export class ChatService {
  static async listChats(workspaceId: string, params?: ListChatsDto): Promise<ListChatsResponseDto> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/chats/${workspaceId}${queryString ? `?${queryString}` : ''}`

    return apiClient.get<ListChatsResponseDto>(endpoint)
  }

  static async getChat(workspaceId: string, chatId: string): Promise<ChatResponseDto> {
    return apiClient.get<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`)
  }

  static async getChatMessages(
    workspaceId: string,
    chatId: string,
    params?: ListChatsDto
  ): Promise<ChatMessagesResponseDto> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/chats/${workspaceId}/${chatId}/messages${queryString ? `?${queryString}` : ''}`

    return apiClient.get<ChatMessagesResponseDto>(endpoint)
  }

  static async createChat(workspaceId: string, data: CreateChatDto): Promise<ChatResponseDto> {
    return apiClient.post<ChatResponseDto>(`/chats/${workspaceId}`, data)
  }

  static async sendMessage(
    workspaceId: string,
    chatId: string,
    data: SendMessageDto
  ): Promise<ChatMessageResponseDto> {
    return apiClient.post<ChatMessageResponseDto>(
      `/chats/${workspaceId}/${chatId}/messages`,
      data
    )
  }

  static async updateChatStatus(
    workspaceId: string,
    chatId: string,
    data: UpdateChatStatusDto
  ): Promise<ChatResponseDto> {
    return apiClient.patch<ChatResponseDto>(`/chats/${workspaceId}/${chatId}/status`, data)
  }

  static async renameChat(workspaceId: string, chatId: string, title: string): Promise<ChatResponseDto> {
    return apiClient.patch<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`, { title })
  }

  static async deleteChat(workspaceId: string, chatId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/chats/${workspaceId}/${chatId}`)
  }

  static async streamChat(
    workspaceId: string,
    chatId: string,
    content: string,
    useWebSearch?: boolean,
    documentIds?: string[]
  ): Promise<ReadableStream<Uint8Array>> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
    const sessionToken = tokenStore.getSessionToken()

    const response = await fetch(`${API_BASE_URL}/v1/chats/${workspaceId}/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'x-parse-session-token': sessionToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        useWebSearch,
        documentIds
      }),
    })

    if (response.status === 401) {
      tokenStore.clear()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Token inválido ou expirado')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    return response.body
  }

  static async markDocumentInChat(
    workspaceId: string,
    chatId: string,
    documentId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `/chats/${workspaceId}/${chatId}/documents`,
      { documentId }
    )
  }

  static async getMarkedDocuments(workspaceId: string, chatId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/chats/${workspaceId}/${chatId}/documents`)
  }

  static async unmarkDocumentFromChat(
    workspaceId: string,
    chatId: string,
    documentId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/chats/${workspaceId}/${chatId}/documents/${documentId}`
    )
  }
}

export const chatService = ChatService
