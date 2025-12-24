import { useState, useCallback, useRef } from 'react';
import { StreamEvent, StreamEventType, StreamChunkData, StreamErrorData } from '@/types/stream';
import { chatService } from '@/lib/api/services/chat.service';

interface UseStreamChatOptions {
  onStreamStart?: () => void;
  onChunk?: (content: string, messageId?: string) => void;
  onStreamEnd?: (fullResponse: string) => void;
  onError?: (error: StreamErrorData) => void;
  onMessageSaved?: (messageId: string, role: 'user' | 'assistant', content: string) => void;
}

interface StreamChatState {
  isStreaming: boolean;
  streamingContent: string;
  currentMessageId?: string;
  error?: string;
  updateCounter: number; // Force re-render
}

export function useStreamChat(options: UseStreamChatOptions = {}) {
  const [state, setState] = useState<StreamChatState>({
    isStreaming: false,
    streamingContent: '',
    updateCounter: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (
    workspaceId: string,
    chatId: string,
    content: string
  ) => {
    console.log('🚀 Starting stream:', { workspaceId, chatId, content });

    // Cleanup any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setState(prev => ({
        ...prev,
        isStreaming: true,
        streamingContent: '',
        error: undefined,
        currentMessageId: undefined,
        updateCounter: 0,
      }));

      options.onStreamStart?.();

      // Use chatService to get the stream
      console.log('📡 Starting stream for:', { workspaceId, chatId, content });
      const stream = await chatService.streamChat(workspaceId, chatId, content);

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Stream reading completed');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          console.log('Received buffer chunk:', buffer);

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines

            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                console.log('Parsing JSON:', jsonStr);
                const eventData = JSON.parse(jsonStr) as StreamEvent;
                console.log('Received event:', eventData);
                await handleStreamEvent(eventData);
              } catch (parseError) {
                console.error('Failed to parse stream event:', parseError, 'Line:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Stream error:', error);
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      options.onError?.({
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'STREAM_ERROR',
      });
    } finally {
      // Ensure we always clean up the streaming state
      setState(prev => ({
        ...prev,
        isStreaming: false,
      }));
    }
  }, [options]);

  const handleStreamEvent = useCallback(async (event: StreamEvent) => {
    switch (event.event) {
      case StreamEventType.MESSAGE_START:
        setState(prev => ({
          ...prev,
          streamingContent: '',
          currentMessageId: undefined,
        }));
        break;

      case StreamEventType.CONTENT_CHUNK:
        const chunkData = event.data as StreamChunkData;
        console.log('💬 Processing chunk:', chunkData.content);
        setState(prev => {
          const newContent = prev.streamingContent + chunkData.content;
          console.log('📄 New streaming content:', newContent);
          console.log('🔄 Forcing state update with counter:', prev.updateCounter + 1);
          return {
            ...prev,
            streamingContent: newContent,
            currentMessageId: chunkData.messageId || prev.currentMessageId,
            updateCounter: prev.updateCounter + 1, // Force re-render
          };
        });
        options.onChunk?.(chunkData.content, chunkData.messageId);
        break;

      case StreamEventType.USER_MESSAGE_SAVED:
      case StreamEventType.AI_MESSAGE_SAVED:
        const savedData = event.data;
        options.onMessageSaved?.(savedData.messageId, savedData.role, savedData.content);
        break;

      case StreamEventType.MESSAGE_END:
        const endData = event.data;
        setState(prev => ({
          ...prev,
          isStreaming: false,
          // NÃO limpa streamingContent aqui - deixa para o componente controlar
        }));
        options.onStreamEnd?.(endData.fullResponse);
        break;

      case StreamEventType.ERROR:
        const errorData = event.data as StreamErrorData;
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: errorData.message,
        }));
        options.onError?.(errorData);
        break;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  const clearStreamingContent = useCallback(() => {
    setState(prev => ({
      ...prev,
      streamingContent: '',
    }));
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    clearStreamingContent,
  };
}