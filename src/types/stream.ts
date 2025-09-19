export enum StreamEventType {
  MESSAGE_START = 'message_start',
  CONTENT_CHUNK = 'content_chunk',
  MESSAGE_END = 'message_end',
  ERROR = 'error',
  USER_MESSAGE_SAVED = 'user_message_saved',
  AI_MESSAGE_SAVED = 'ai_message_saved'
}

export interface StreamEvent {
  event: StreamEventType;
  data: any;
  timestamp: string;
}

export interface StreamChunkData {
  content: string;
  messageId?: string;
}

export interface StreamMessageSavedData {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface StreamErrorData {
  message: string;
  code?: string;
}

export interface StreamMessageStartData {
  chatId: string;
  content: string;
}

export interface StreamMessageEndData {
  chatId: string;
  userMessageId: string;
  aiMessageId: string;
  fullResponse: string;
}