import { apiClient } from '@/lib/api/client/base.client';
import type {
  ChatResponseDto,
  ListChatsResponseDto,
  CreateChatDto,
  SendMessageDto,
  ChatMessageResponseDto,
  ChatMessagesResponseDto,
  UpdateChatStatusDto,
  ListChatsDto,
} from '@/types/chat';

class ChatService {
  async listChats(workspaceId: string, params?: ListChatsDto): Promise<ListChatsResponseDto> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/chats/${workspaceId}${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get<ListChatsResponseDto>(endpoint);
    } catch (error: any) {
      throw error;
    }
  }

  async getChat(workspaceId: string, chatId: string): Promise<ChatResponseDto> {
    try {
      return await apiClient.get<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`);
    } catch (error: any) {
      throw error;
    }
  }

  async getChatMessages(
    workspaceId: string,
    chatId: string,
    params?: ListChatsDto
  ): Promise<ChatMessagesResponseDto> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/chats/${workspaceId}/${chatId}/messages${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get<ChatMessagesResponseDto>(endpoint);
    } catch (error: any) {
      throw error;
    }
  }

  async createChat(workspaceId: string, data: CreateChatDto): Promise<ChatResponseDto> {
    try {
      return await apiClient.post<ChatResponseDto>(`/chats/${workspaceId}`, data);
    } catch (error: any) {
      throw error;
    }
  }

  async sendMessage(
    workspaceId: string,
    chatId: string,
    data: SendMessageDto
  ): Promise<ChatMessageResponseDto> {
    try {
      return await apiClient.post<ChatMessageResponseDto>(
        `/chats/${workspaceId}/${chatId}/messages`,
        data
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateChatStatus(
    workspaceId: string,
    chatId: string,
    data: UpdateChatStatusDto
  ): Promise<ChatResponseDto> {
    try {
      return await apiClient.patch<ChatResponseDto>(`/chats/${workspaceId}/${chatId}/status`, data);
    } catch (error: any) {
      throw error;
    }
  }

  async renameChat(workspaceId: string, chatId: string, title: string): Promise<ChatResponseDto> {
    try {
      return await apiClient.patch<ChatResponseDto>(`/chats/${workspaceId}/${chatId}`, { title });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteChat(workspaceId: string, chatId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete<{ success: boolean }>(`/chats/${workspaceId}/${chatId}`);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Stream chat response - returns a ReadableStream for streaming responses
   * Note: This method uses fetch directly because apiClient doesn't support streaming yet
   * Note: Documents must be marked BEFORE calling this method using markDocumentInChat
   */
  async streamChat(
    workspaceId: string,
    chatId: string,
    content: string
  ): Promise<ReadableStream<Uint8Array>> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
    const { tokenStore } = await import('@/lib/auth/stores/auth.store');
    const accessToken = tokenStore.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/chats/${workspaceId}/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'x-parse-session-token': accessToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    // Handle 401 - redirect to login
    if (response.status === 401) {
      tokenStore.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Token inválido ou expirado');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body;
  }

  /**
   * Marcar um documento em um chat
   */
  async markDocumentInChat(
    workspaceId: string,
    chatId: string,
    documentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>(
        `/chats/${workspaceId}/${chatId}/documents`,
        { documentId }
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Listar documentos marcados em um chat
   */
  async getMarkedDocuments(
    workspaceId: string,
    chatId: string
  ): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`/chats/${workspaceId}/${chatId}/documents`);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Desmarcar um documento de um chat
   */
  async unmarkDocumentFromChat(
    workspaceId: string,
    chatId: string,
    documentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.delete<{ success: boolean; message: string }>(
        `/chats/${workspaceId}/${chatId}/documents/${documentId}`
      );
    } catch (error: any) {
      throw error;
    }
  }
}

export const chatService = new ChatService();

