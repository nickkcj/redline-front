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
import { Globe, FileText, X, Sparkles, MessageSquare } from "lucide-react"
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
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

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
      // Clear optimistic messages and refresh real data
      setOptimisticMessages([])
      queryClient.invalidateQueries({ queryKey: ["chat-messages", workspaceId, chatId] })
      queryClient.invalidateQueries({ queryKey: ["chats", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["chat", workspaceId, chatId] })
      clearStreamingContent()
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar mensagem")
      setOptimisticMessages([])
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

  const handleSubmit = React.useCallback(
    async (promptMessage: { text?: string; files?: any[] }) => {
      if (!promptMessage.text?.trim()) return

      const userMessage = promptMessage.text.trim()
      let targetChatId = chatId

      // Add optimistic user message
      const optimisticUserMessage: OptimisticMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user" as MessageRole,
        content: userMessage,
        isOptimistic: true,
      }
      setOptimisticMessages([optimisticUserMessage])

      // Create chat if needed
      if (!targetChatId) {
        try {
          const newChat = await createChat({
            title: userMessage.slice(0, 50),
          })
          targetChatId = newChat.id
          onChatCreated?.(targetChatId)
        } catch (error) {
          toast.error("Erro ao criar chat")
          setOptimisticMessages([])
          return
        }
      }

      // Start streaming
      try {
        await startStream(workspaceId, targetChatId, userMessage, useWebSearch)
      } catch (error) {
        toast.error("Erro ao enviar mensagem")
        setOptimisticMessages([])
      }
    },
    [
      chatId,
      workspaceId,
      createChat,
      startStream,
      useWebSearch,
      onChatCreated,
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
              <Sparkles className="w-8 h-8 text-primary" />
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
                <MessageSquare className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />
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
    <div className={cn("flex flex-col h-full bg-background", className)}>
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
                  <Message key={msg.id} from={msg.role}>
                    <MessageAvatar
                      src={
                        msg.role === "user"
                          ? "/user-avatar.png"
                          : "/ai-avatar.png"
                      }
                      name={msg.role === "user" ? "You" : "AI"}
                    />
                    <MessageContent variant="flat">
                      {msg.role === "assistant" ? (
                        <Response>{msg.content}</Response>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </MessageContent>
                  </Message>
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <Message from="assistant">
                    <MessageAvatar src="/ai-avatar.png" name="AI" />
                    <MessageContent variant="flat">
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
                    </MessageContent>
                  </Message>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Marked Documents Badge */}
      {markedDocs.length > 0 && (
        <div className="border-t border-border px-4 py-2 bg-accent/50">
          <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              Documentos no contexto:
            </span>
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
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
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
