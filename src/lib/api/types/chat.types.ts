// ============================================================
// CHAT TYPES - Alinhado com chat.controller.ts do backend
// ============================================================

import { DocumentResponseDto } from './document.types'

// ========== MESSAGE ROLE ==========

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

// ========== CHAT MESSAGE ==========

export interface ChatMessageResponseDto {
  id: string
  chatId: string
  role: MessageRole
  content: string
  aiModel?: string
  tokens?: number
  createdAt: Date
}

// ========== CHAT ==========

export interface ChatResponseDto {
  id: string
  workspaceId: string
  title?: string
  isActive: boolean
  createdBy?: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessageResponseDto[]
  documents?: DocumentResponseDto[]
}

// ========== CREATE CHAT ==========

/**
 * POST /chats/:workspaceId
 * Request para criar chat
 */
export interface CreateChatDto {
  title?: string
  initialMessage?: string
}

// ========== LIST CHATS ==========

/**
 * GET /chats/:workspaceId
 * Query params para listar chats
 */
export interface ListChatsDto {
  page?: number
  limit?: number
}

/**
 * Response de listagem de chats
 */
export interface ListChatsResponseDto {
  chats: Omit<ChatResponseDto, 'messages'>[]
  total: number
  page: number
  limit: number
  pages: number
}

// ========== SEND MESSAGE ==========

/**
 * POST /chats/:workspaceId/:chatId/messages
 * Request para enviar mensagem (sem streaming)
 */
export interface SendMessageDto {
  content: string
  role: MessageRole
}

// ========== STREAM MESSAGE ==========

/**
 * POST /chats/:workspaceId/:chatId/stream
 * Request para enviar mensagem com streaming
 */
export interface StreamMessageDto {
  content: string
  useWebSearch?: boolean
}

/**
 * Stream response event types
 */
export interface StreamResponseDto {
  event: 'content_chunk' | 'message_complete' | 'error'
  data: {
    content?: string
    message?: ChatMessageResponseDto
    error?: string
  }
  timestamp: string
}

// ========== UPDATE CHAT STATUS ==========

/**
 * PATCH /chats/:workspaceId/:chatId/status
 * Request para atualizar status do chat
 */
export interface UpdateChatStatusDto {
  isActive: boolean
}

// ========== CHAT MESSAGES ==========

/**
 * GET /chats/:workspaceId/:chatId/messages
 * Response de mensagens paginadas
 */
export interface ChatMessagesResponseDto {
  messages: ChatMessageResponseDto[]
  total: number
  page: number
  limit: number
  pages: number
}

// ========== MARK DOCUMENT ==========

/**
 * POST /chats/:workspaceId/:chatId/documents
 * Request para marcar documento no chat
 */
export interface MarkDocumentDto {
  documentId: string
}

/**
 * Response de marcar/desmarcar documento
 */
export interface DocumentMarkResponse {
  success: boolean
  message: string
}

// ========== DELETE CHAT ==========

/**
 * DELETE /chats/:workspaceId/:chatId
 * Response de deletar chat
 */
export interface DeleteChatResponse {
  success: boolean
}
