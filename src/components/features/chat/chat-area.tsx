"use client";

import * as React from "react";
import { cn } from "@/lib/utils/date.utils";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";
import { useStreamChat } from "@/hooks/api/use-stream-chat";
import { useChatMessages, useCreateChat } from "@/hooks/api/use-chat";
import { useDocuments } from "@/hooks/api/use-documents";
import { useMarkedDocuments, useMarkDocument, useUnmarkDocument } from "@/hooks/api/use-chat-documents";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DocumentMarker } from "@/components/features/workspace/document-marker";
import type { DocumentResponseDto } from "@/lib/api/services/document.service";
import type { ChatMessageResponseDto } from "@/types/chat";

export interface ChatAreaProps {
  workspaceId: string;
  chatId: string | null;
  onChatCreated?: (chatId: string) => void;
  className?: string;
}

export function ChatArea({
  workspaceId,
  chatId,
  onChatCreated,
  className,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [attachedDocIds, setAttachedDocIds] = React.useState<string[]>([]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(
    workspaceId,
    chatId || ""
  );
  const { data: documents = [] } = useDocuments(workspaceId);
  const { data: markedDocs = [] } = useMarkedDocuments(workspaceId, chatId || "");

  // Mutations
  const { mutateAsync: createChat, isPending: creatingChat } =
    useCreateChat(workspaceId);
  const { mutateAsync: markDocument } = useMarkDocument(workspaceId);
  const { mutateAsync: unmarkDocument } = useUnmarkDocument(workspaceId);

  // Streaming
  const {
    isStreaming,
    streamingContent,
    startStream,
    clearStreamingContent,
  } = useStreamChat({
    onStreamEnd: () => {
      // Invalidar queries para atualizar mensagens e lista de chats
      queryClient.invalidateQueries({ queryKey: ['chat-messages', workspaceId, chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats', workspaceId] });
      clearStreamingContent();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar mensagem");
    },
  });

  const messages = messagesData?.messages || [];
  const attachedDocuments = React.useMemo(
    () => documents.filter((doc) => attachedDocIds.includes(doc.id)),
    [documents, attachedDocIds]
  );

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, streamingContent]);

  const handleSubmit = React.useCallback(
    async (message: string, documentIds: string[]) => {
      let targetChatId = chatId;

      // Se não houver chat, criar um novo
      if (!targetChatId) {
        try {
          const newChat = await createChat({ title: message.slice(0, 50) });
          targetChatId = newChat.id;
          onChatCreated?.(targetChatId);
        } catch (error) {
          toast.error("Erro ao criar chat");
          return;
        }
      }

      // Iniciar streaming
      try {
        await startStream(workspaceId, targetChatId, message, documentIds);
        setInputValue("");
        setAttachedDocIds([]);
      } catch (error) {
        toast.error("Erro ao enviar mensagem");
      }
    },
    [chatId, workspaceId, createChat, startStream, onChatCreated]
  );

  const handleDocumentAttach = React.useCallback((documentId: string) => {
    setAttachedDocIds((prev) =>
      prev.includes(documentId) ? prev : [...prev, documentId]
    );
  }, []);

  const handleDocumentDetach = React.useCallback((documentId: string) => {
    setAttachedDocIds((prev) => prev.filter((id) => id !== documentId));
  }, []);

  const handleMarkDocument = React.useCallback(
    async (documentId: string) => {
      if (!chatId) return;
      await markDocument({ chatId, documentId });
    },
    [chatId, markDocument]
  );

  const handleUnmarkDocument = React.useCallback(
    async (documentId: string) => {
      if (!chatId) return;
      await unmarkDocument({ chatId, documentId });
    },
    [chatId, unmarkDocument]
  );

  // Empty state
  if (!chatId) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full p-4 sm:p-8 bg-white overflow-y-auto overflow-x-hidden",
          className
        )}
      >
        <div className="max-w-2xl w-full space-y-6 sm:space-y-8 min-w-0">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-gray-900">
              Como posso ajudar?
            </h1>
            <p className="text-sm text-gray-600">
              Inicie uma conversa ou selecione um chat existente
            </p>
          </div>

          {/* Suggestion Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start border-border text-gray-900 hover:bg-muted/50"
              onClick={() =>
                setInputValue("Me ajude a entender este documento...")
              }
            >
              <MessageSquare className="size-4 mr-2 shrink-0 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-left flex-1 min-w-0" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                textOverflow: 'ellipsis'
              }}>
                Me ajude a entender este documento...
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start border-border text-gray-900 hover:bg-muted/50"
              onClick={() =>
                setInputValue("Resuma os principais pontos deste arquivo...")
              }
            >
              <MessageSquare className="size-4 mr-2 shrink-0 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-left flex-1 min-w-0" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                textOverflow: 'ellipsis'
              }}>
                Resuma os principais pontos deste arquivo...
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start border-border text-gray-900 hover:bg-muted/50"
              onClick={() =>
                setInputValue("Quais são as informações mais relevantes?")
              }
            >
              <MessageSquare className="size-4 mr-2 shrink-0 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-left flex-1 min-w-0" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                textOverflow: 'ellipsis'
              }}>
                Quais são as informações mais relevantes?
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start border-border text-gray-900 hover:bg-muted/50"
              onClick={() =>
                setInputValue("Crie um relatório baseado nestes dados...")
              }
            >
              <MessageSquare className="size-4 mr-2 shrink-0 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-left flex-1 min-w-0" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                textOverflow: 'ellipsis'
              }}>
                Crie um relatório baseado nestes dados...
              </span>
            </Button>
          </div>

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onDocumentAttach={handleDocumentAttach}
            onDocumentDetach={handleDocumentDetach}
            attachedDocuments={attachedDocuments}
            availableDocuments={documents}
            isLoading={creatingChat || isStreaming}
            placeholder="Digite sua mensagem..."
          />
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className={cn("flex flex-col h-full bg-white overflow-hidden", className)}>
      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 bg-white">
          <div className="max-w-3xl mx-auto py-6 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-8 border-4 border-border border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((message: ChatMessageResponseDto) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming={true}
                />
              )}
            </>
          )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-white p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Document Marker */}
          <DocumentMarker
            workspaceId={workspaceId}
            chatId={chatId}
            documents={documents}
            markedDocuments={markedDocs}
            onMark={handleMarkDocument}
            onUnmark={handleUnmarkDocument}
            disabled={isStreaming}
          />

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onDocumentAttach={handleDocumentAttach}
            onDocumentDetach={handleDocumentDetach}
            attachedDocuments={attachedDocuments}
            availableDocuments={documents}
            isLoading={isStreaming}
            placeholder="Digite sua mensagem..."
          />
        </div>
      </div>
    </div>
  );
}
