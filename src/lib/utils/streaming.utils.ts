/**
 * Utilitário para parsing de Server-Sent Events (SSE) streams
 *
 * Este módulo fornece funções para processar streams SSE do backend,
 * lidando com buffering, decodificação e parsing de JSON.
 */

/**
 * Dados de um evento SSE do chat
 */
export interface SSEChatEvent {
  event: string
  data?: {
    content?: string
    [key: string]: any
  }
}

/**
 * Opções para parseamento de SSE
 */
export interface ParseSSEOptions {
  /**
   * Callback chamado para cada chunk de conteúdo recebido
   */
  onContent: (content: string) => void
  /**
   * Callback opcional chamado quando stream termina
   */
  onDone?: () => void
  /**
   * Callback opcional para erros de parsing (não-críticos)
   */
  onParseError?: (line: string, error: Error) => void
}

/**
 * Faz parsing de um SSE stream do backend
 *
 * @param stream - ReadableStream retornado pelo fetch
 * @param options - Callbacks para processar eventos
 *
 * @example
 * ```typescript
 * const stream = await chatService.streamChat(workspaceId, chatId, message)
 * let fullMessage = ""
 *
 * await parseSSEStream(stream, {
 *   onContent: (content) => {
 *     fullMessage += content
 *     setMessages(prev => updateLastMessage(prev, fullMessage))
 *   },
 *   onDone: () => console.log("Stream concluído")
 * })
 * ```
 */
export async function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  options: ParseSSEOptions
): Promise<void> {
  const { onContent, onDone, onParseError } = options

  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Decodificar chunk e adicionar ao buffer
      buffer += decoder.decode(value, { stream: true })

      // Processar linhas completas (terminadas com \n)
      const lines = buffer.split('\n')
      // Manter última linha incompleta no buffer
      buffer = lines.pop() || ""

      // Processar cada linha completa
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as SSEChatEvent

            // Extrair conteúdo do evento content_chunk
            if (data.event === 'content_chunk' && data.data?.content) {
              onContent(data.data.content)
            }
          } catch (error) {
            // Linha não é JSON válido ou formato inesperado
            // Não é crítico, apenas log debug
            if (onParseError) {
              onParseError(line, error as Error)
            } else {
              console.debug('SSE line não é JSON válido:', line)
            }
          }
        }
      }
    }

    // Processar qualquer conteúdo restante no buffer
    if (buffer.trim() && buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6)) as SSEChatEvent
        if (data.event === 'content_chunk' && data.data?.content) {
          onContent(data.data.content)
        }
      } catch (error) {
        // Ignorar erros no buffer final
        if (onParseError) {
          onParseError(buffer, error as Error)
        }
      }
    }

    // Notificar conclusão
    if (onDone) {
      onDone()
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Helper para criar callback de atualização de mensagem
 * Útil para uso com React setState
 *
 * @example
 * ```typescript
 * let fullContent = ""
 * await parseSSEStream(stream, {
 *   onContent: (chunk) => {
 *     fullContent += chunk
 *     setMessages(prev => updateMessageContent(prev, messageId, fullContent))
 *   }
 * })
 * ```
 */
export function createContentAccumulator(
  onUpdate: (accumulatedContent: string) => void
): (chunk: string) => void {
  let accumulated = ""

  return (chunk: string) => {
    accumulated += chunk
    onUpdate(accumulated)
  }
}
