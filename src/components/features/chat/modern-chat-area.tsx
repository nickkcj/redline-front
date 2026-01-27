"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ui/ai-elements/prompt-input"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/ai-elements/message"
import { Response } from "@/components/ui/ai-elements/response"
import { Globe, FileText, X, Sparkle, ChatCircle } from "@phosphor-icons/react"
import { DocumentSelector } from "./document-selector"
import {
  useChatMessages,
  useCreateChat,
  useStreamChat,
  useMarkedDocuments,
  useMarkDocument,
  useUnmarkDocument,
} from "@/hooks/api/use-chat"
import { useDocuments } from "@/hooks/api/use-documents"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { ChatMessageResponseDto, MessageRole } from "@/lib/api/types/chat.types"

export interface ModernChatAreaProps {
  workspaceId: string
  chatId: string | null
  onChatCreated?: (chatId: string) => void
  className?: string
}

interface OptimisticMessage {
  id: string
  role: MessageRole
  content: string
  isOptimistic?: boolean
}

export function ModernChatArea({
  workspaceId,
  chatId,
  onChatCreated,
  className,
}: ModernChatAreaProps) {
  const [useWebSearch, setUseWebSearch] = React.useState(false)
  const [optimisticMessages, setOptimisticMessages] = React.useState<OptimisticMessage[]>([])
  const [draggedDocumentIds, setDraggedDocumentIds] = React.useState<string[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const lastSentMessageRef = React.useRef<string | null>(null)
  const currentChatIdRef = React.useRef<string | null>(chatId)
  const waitingForInvalidationRef = React.useRef(false)
  const messageCountBeforeInvalidationRef = React.useRef(0)

  // Keep chatId ref updated
  React.useEffect(() => {
    currentChatIdRef.current = chatId
  }, [chatId])

  // Queries
  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(
    workspaceId,
    chatId || "",
    {
      enabled: !!chatId,
    }
  )
  const { data: documents = [] } = useDocuments(workspaceId)
  const { data: markedDocs = [] } = useMarkedDocuments(workspaceId, chatId || "")

  // Mutations
  const { mutateAsync: createChat, isPending: creatingChat } =
    useCreateChat(workspaceId)
  const { mutateAsync: markDocument } = useMarkDocument(workspaceId)
  const { mutateAsync: unmarkDocument } = useUnmarkDocument(workspaceId)

  // Streaming
  const {
    isStreaming,
    streamingContent,
    startStream,
    clearStreamingContent,
  } = useStreamChat({
    onStreamEnd: () => {
      console.log('Stream ended, marking waiting for invalidation')
      // Mark that we're waiting for invalidation
      waitingForInvalidationRef.current = true
      messageCountBeforeInvalidationRef.current = messagesData?.messages?.length || 0

      // Wait a bit to ensure backend has saved the messages
      setTimeout(() => {
        const activeChatId = currentChatIdRef.current
        console.log('Invalidating queries after stream for chatId:', activeChatId)
        if (activeChatId) {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", workspaceId, activeChatId] })
          queryClient.invalidateQueries({ queryKey: ["chat", workspaceId, activeChatId] })
        }
        queryClient.invalidateQueries({ queryKey: ["chats", workspaceId] })
      }, 300)
    },
    onError: (error) => {
      console.error('Stream error:', error)
      toast.error(error.message || "Erro ao processar mensagem")
      setOptimisticMessages([])
      clearStreamingContent()
      lastSentMessageRef.current = null
      waitingForInvalidationRef.current = false
    },
  })

  // Combine server messages with optimistic messages
  const allMessages = React.useMemo(() => {
    const serverMessages = messagesData?.messages || []
    return [...serverMessages, ...optimisticMessages]
  }, [messagesData?.messages, optimisticMessages])

  // Get marked document IDs
  const markedDocumentIds = React.useMemo(
    () => markedDocs.map((doc: any) => doc.id),
    [markedDocs]
  )

  // Clear streaming content and optimistic messages when real messages include our sent message
  React.useEffect(() => {
    const currentMessageCount = messagesData?.messages?.length || 0
    const previousCount = messageCountBeforeInvalidationRef.current

    console.log('[useEffect] Checking if should clear optimistic:', {
      isStreaming,
      hasMessages: !!messagesData?.messages,
      messageCount: currentMessageCount,
      lastSent: lastSentMessageRef.current,
      waitingForInvalidation: waitingForInvalidationRef.current,
      messageCountChanged: currentMessageCount > previousCount,
    })

    // Don't clear if streaming or waiting for invalidation (unless messages actually updated)
    if (isStreaming) return
    if (waitingForInvalidationRef.current && currentMessageCount <= previousCount) {
      console.log('[useEffect] Waiting for invalidation to complete, skipping clear')
      return
    }

    // Messages have been updated after invalidation
    if (waitingForInvalidationRef.current && currentMessageCount > previousCount) {
      console.log('[useEffect] Messages updated after invalidation, can now clear')
      waitingForInvalidationRef.current = false
    }

    if (messagesData?.messages && lastSentMessageRef.current) {
      // Check if our last sent message is in the real messages
      const hasOurMessage = messagesData.messages.some(
        msg => msg.content.trim() === lastSentMessageRef.current?.trim()
      )

      console.log('[useEffect] Has our message in real messages?', hasOurMessage)

      if (hasOurMessage) {
        console.log('[useEffect] Real messages include our sent message, clearing optimistic state')
        clearStreamingContent()
        setOptimisticMessages([])
        lastSentMessageRef.current = null
        waitingForInvalidationRef.current = false
      }
    }
  }, [messagesData?.messages, isStreaming, clearStreamingContent])

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [allMessages, streamingContent])

  const handleToggleDocument = React.useCallback(
    async (documentId: string, shouldMark: boolean) => {
      if (!chatId) {
        toast.error("Crie um chat primeiro")
        return
      }

      try {
        if (shouldMark) {
          await markDocument({ chatId, documentId })
        } else {
          await unmarkDocument({ chatId, documentId })
        }
      } catch (error) {
        toast.error("Erro ao atualizar documentos")
      }
    },
    [chatId, markDocument, unmarkDocument]
  )

  // Combine marked documents with dragged documents
  const attachedDocumentIds = React.useMemo(() => {
    return Array.from(new Set([...markedDocumentIds, ...draggedDocumentIds]))
  }, [markedDocumentIds, draggedDocumentIds])

  // Handle drag & drop
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    try {
      const data = e.dataTransfer.getData('application/json')
      if (data) {
        const { documentIds } = JSON.parse(data)
        if (Array.isArray(documentIds)) {
          setDraggedDocumentIds(prev => Array.from(new Set([...prev, ...documentIds])))
          toast.success(`${documentIds.length} documento(s) adicionado(s)`)
        }
      }
    } catch (error) {
      console.error('Error processing drop:', error)
    }
  }, [])

  const handleRemoveDocument = React.useCallback((docId: string) => {
    setDraggedDocumentIds(prev => prev.filter(id => id !== docId))
  }, [])

  const handleSubmit = React.useCallback(
    async (promptMessage: { text?: string; files?: any[] }) => {
      if (!promptMessage.text?.trim()) return

      const userMessage = promptMessage.text.trim()

      // Save message to ref for tracking
      lastSentMessageRef.current = userMessage

      // Add user message optimistically IMMEDIATELY for instant feedback
      const optimisticUserMessage: OptimisticMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user" as MessageRole,
        content: userMessage,
        isOptimistic: true,
      }
      console.log('[handleSubmit] Adding optimistic message IMMEDIATELY:', userMessage)
      setOptimisticMessages([optimisticUserMessage])

      let targetChatId = chatId

      try {
        // Create chat if needed (with temporary title that will be auto-generated by AI)
        if (!targetChatId) {
          const newChat = await createChat({
            title: "Nova conversa...",
          })
          targetChatId = newChat.id

          // Update the ref IMMEDIATELY with new chatId
          console.log('[handleSubmit] Created new chat, updating ref to:', targetChatId)
          currentChatIdRef.current = targetChatId

          // Call onChatCreated BEFORE starting stream to prevent URL change mid-stream
          if (onChatCreated) {
            await new Promise<void>((resolve) => {
              onChatCreated(targetChatId!)
              // Give a small delay for URL to update and component to settle
              setTimeout(resolve, 150)
            })
          }
        }

        // Start streaming with attached documents
        await startStream(
          workspaceId,
          targetChatId,
          userMessage,
          useWebSearch,
          attachedDocumentIds.length > 0 ? attachedDocumentIds : undefined
        )

        // Clear dragged documents after sending
        setDraggedDocumentIds([])
      } catch (error) {
        toast.error("Erro ao enviar mensagem")
        // Remove optimistic message on error
        setOptimisticMessages([])
        lastSentMessageRef.current = null
      }
    },
    [
      chatId,
      workspaceId,
      createChat,
      startStream,
      useWebSearch,
      onChatCreated,
      attachedDocumentIds,
    ]
  )

  // Empty state
  if (!chatId) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full p-8 bg-background",
          className
        )}
      >
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkle weight="bold" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Como posso ajudar?
            </h1>
            <p className="text-muted-foreground">
              Inicie uma conversa ou selecione um chat existente
            </p>
          </div>

          {/* Suggestion Pills */}
          <div className="grid grid-cols-2 gap-3">
            {[
              "Me ajude a entender este documento...",
              "Resuma os principais pontos deste arquivo...",
              "Quais são as informações mais relevantes?",
              "Crie um relatório baseado nestes dados...",
            ].map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-4 px-4 text-left justify-start hover:bg-accent"
              >
                <ChatCircle weight="bold" className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />
                <span className="text-sm line-clamp-2">{suggestion}</span>
              </Button>
            ))}
          </div>

          {/* Input */}
          <PromptInput onSubmit={handleSubmit} className="shadow-lg">
            <PromptInputBody>
              <PromptInputTextarea placeholder="Digite sua mensagem..." />
              <PromptInputToolbar>
                <PromptInputTools>
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="web-search-empty"
                        checked={useWebSearch}
                        onCheckedChange={setUseWebSearch}
                      />
                      <Label
                        htmlFor="web-search-empty"
                        className="text-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Buscar na web
                      </Label>
                    </div>
                  </div>
                </PromptInputTools>
                <PromptInputSubmit
                  status={creatingChat || isStreaming ? "submitted" : undefined}
                  disabled={creatingChat || isStreaming}
                />
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>
    )
  }

  // Chat view
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background relative",
        isDragOver && "ring-2 ring-primary ring-inset",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-background border-2 border-dashed border-primary rounded-lg p-8">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 text-primary" />
              <p className="text-lg font-medium">Solte para adicionar documentos</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {allMessages.map((msg) => (
                  <Message
                    key={msg.id}
                    from={msg.role}
                    avatar={
                      <MessageAvatar
                        src={
                          String(msg.role).toLowerCase() === "user"
                            ? "/user-avatar.png"
                            : "/ai-avatar.png"
                        }
                        name={String(msg.role).toLowerCase() === "user" ? "You" : "AI"}
                      />
                    }
                  >
                    <MessageContent variant="flat" from={msg.role}>
                      {String(msg.role).toLowerCase() === "assistant" ? (
                        <Response>{msg.content}</Response>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </MessageContent>
                  </Message>
                ))}

                {/* Streaming message or typing indicator */}
                {isStreaming && (
                  <Message
                    from="assistant"
                    avatar={<MessageAvatar src="/ai-avatar.png" name="AI" />}
                  >
                    <MessageContent variant="flat" from="assistant">
                      {streamingContent ? (
                        <>
                          <Response>{streamingContent}</Response>
                          <div className="flex items-center gap-1 mt-2">
                            <span
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">Pensando...</span>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Attached Documents Badge - Show both marked and dragged */}
      {attachedDocumentIds.length > 0 && (
        <div className="border-t border-border px-4 py-2 bg-accent/50">
          <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              Documentos anexados ({attachedDocumentIds.length}):
            </span>
            {/* Marked documents */}
            {markedDocs.map((doc: any) => (
              <Badge
                key={doc.id}
                variant="secondary"
                className="text-xs gap-1 pr-1"
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{doc.name}</span>
                <button
                  onClick={() => handleToggleDocument(doc.id, false)}
                  className="hover:bg-background rounded-full p-0.5 ml-1"
                  title="Remover do contexto"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {/* Dragged documents */}
            {draggedDocumentIds.map((docId) => {
              const doc = documents.find(d => d.id === docId)
              if (!doc) return null
              return (
                <Badge
                  key={docId}
                  variant="default"
                  className="text-xs gap-1 pr-1 bg-primary/20"
                >
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[120px] truncate">{doc.name}</span>
                  <button
                    onClick={() => handleRemoveDocument(docId)}
                    className="hover:bg-background rounded-full p-0.5 ml-1"
                    title="Remover da mensagem"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Digite sua mensagem..."
                disabled={isStreaming}
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <div className="flex items-center gap-3 px-2">
                    {/* Document Selector */}
                    <DocumentSelector
                      documents={documents}
                      markedDocumentIds={markedDocumentIds}
                      onToggleDocument={handleToggleDocument}
                      disabled={isStreaming}
                    />

                    {/* Web Search Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="web-search"
                        checked={useWebSearch}
                        onCheckedChange={setUseWebSearch}
                        disabled={isStreaming}
                      />
                      <Label
                        htmlFor="web-search"
                        className="text-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Web
                      </Label>
                    </div>
                  </div>
                </PromptInputTools>
                <PromptInputSubmit
                  status={isStreaming ? "streaming" : undefined}
                  disabled={isStreaming}
                />
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
