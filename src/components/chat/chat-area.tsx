"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";
import { useStreamChat } from "@/hooks/api/use-stream-chat";
import { useChatMessages, useCreateChat } from "@/hooks/api/use-chat";
import { useDocuments } from "@/hooks/api/use-documents";
import { useMarkedDocuments } from "@/hooks/api/use-chat-documents";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  // Empty state
  if (!chatId) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full p-8",
          className
        )}
      >
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-medium text-foreground">
              Como posso ajudar?
            </h1>
            <p className="text-sm text-muted-foreground">
              Inicie uma conversa ou selecione um chat existente
            </p>
          </div>

          {/* Suggestion Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 px-6 text-left justify-start"
              onClick={() =>
                setInputValue("Me ajude a entender este documento...")
              }
            >
              <MessageSquare className="size-5 mr-3 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                Me ajude a entender este documento...
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 text-left justify-start"
              onClick={() =>
                setInputValue("Resuma os principais pontos deste arquivo...")
              }
            >
              <MessageSquare className="size-5 mr-3 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                Resuma os principais pontos deste arquivo...
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 text-left justify-start"
              onClick={() =>
                setInputValue("Quais são as informações mais relevantes?")
              }
            >
              <MessageSquare className="size-5 mr-3 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                Quais são as informações mais relevantes?
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 text-left justify-start"
              onClick={() =>
                setInputValue("Crie um relatório baseado nestes dados...")
              }
            >
              <MessageSquare className="size-5 mr-3 shrink-0 text-muted-foreground" />
              <span className="text-sm">
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
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="max-w-3xl mx-auto py-6 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
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

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto">
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
