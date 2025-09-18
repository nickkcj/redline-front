export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface CreateChatDto {
  title?: string;
  initialMessage?: string;
}

export interface SendMessageDto {
  content: string;
  role: MessageRole;
}

export interface ChatMessageResponseDto {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  aiModel?: string;
  tokens?: number;
  createdAt: Date;
}

export interface ChatResponseDto {
  id: string;
  workspaceId: string;
  title?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessageResponseDto[];
}

export interface ListChatsResponseDto {
  chats: Omit<ChatResponseDto, 'messages'>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UpdateChatStatusDto {
  isActive: boolean;
}

export interface ListChatsDto {
  page?: number;
  limit?: number;
}

export interface ChatMessagesResponseDto {
  messages: ChatMessageResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}