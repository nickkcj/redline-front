"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Menu, Send, FileText, X } from "lucide-react";
import { chatService } from "@/lib/api/services/chat.service";
import { useChat, useCreateChat } from "@/hooks/api/use-chat";
import { useMarkedDocuments, useUnmarkDocument } from "@/hooks/api/use-chat-documents";
import { toast } from "sonner";
import type { ChatMessageResponseDto } from "@/types/chat";
import { Badge } from "@/components/ui/badge";

interface WorkspaceChatProps {
  workspaceId: string;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
  chatId?: string;
  onChatIdChange?: (chatId: string) => void;
  onDocumentContextRef?: React.MutableRefObject<((documentId: string, documentName: string) => void) | null>;
}

export function WorkspaceChat({ 
  workspaceId, 
  onSidebarToggle,
  sidebarOpen,
  chatId,
  onChatIdChange,
  onDocumentContextRef
}: WorkspaceChatProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentChatId, setCurrentChatId] = React.useState<string | undefined>(chatId);
  
  const createChatMutation = useCreateChat(workspaceId);
  const { data: chatData } = useChat(workspaceId, currentChatId || "");
  const { data: markedDocuments = [] } = useMarkedDocuments(workspaceId, currentChatId || "");
  const unmarkDocumentMutation = useUnmarkDocument(workspaceId, currentChatId || "");

  // Carregar mensagens do chat quando chatId mudar ou quando chatData for carregado
  React.useEffect(() => {
    if (chatData?.messages) {
      const formattedMessages = chatData.messages.map((msg: ChatMessageResponseDto) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [chatData]);

  // Atualizar chatId quando mudar externamente
  React.useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (
    message: { text?: string; files?: any[] },
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    
    const messageText = message.text?.trim() || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = messageText;
    setInput("");
    setIsLoading(true);

    try {
      let activeChatId = currentChatId;

      // Se não temos um chat, criar um novo
      if (!activeChatId) {
        const newChat = await createChatMutation.mutateAsync({
          title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
          initialMessage: messageContent,
        });
        activeChatId = newChat.id;
        setCurrentChatId(activeChatId);
        onChatIdChange?.(activeChatId);
      }

      // Stream da resposta da IA
      const stream = await chatService.streamChat(workspaceId, activeChatId, messageContent);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantMessageId = (Date.now() + 1).toString();
      let buffer = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decodificar chunk e adicionar ao buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Processar linhas completas (terminadas com \n)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Manter última linha incompleta no buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event === 'content_chunk' && data.data?.content) {
                assistantMessage += data.data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessage }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Se não for JSON válido, ignorar (pode ser um evento diferente)
              console.debug('SSE line não é JSON válido:', line);
            }
          }
        }
      }
      
      // Processar qualquer conteúdo restante no buffer
      if (buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.slice(6));
            if (data.event === 'content_chunk' && data.data?.content) {
              assistantMessage += data.data.content;
            }
          } catch (e) {
            // Ignorar
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro ao processar sua mensagem. Por favor, tente novamente.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Erro ao processar sua mensagem. Por favor, tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Função para enviar documento como contexto
  const handleDocumentContext = React.useCallback(async (documentId: string, documentName: string) => {
    if (isLoading) return;

    // Criar ou usar chat existente
    let activeChatId = currentChatId;

    if (!activeChatId) {
      try {
        const newChat = await createChatMutation.mutateAsync({
          title: `Chat sobre ${documentName}`,
          initialMessage: `Analise o documento "${documentName}" (ID: ${documentId})`,
        });
        activeChatId = newChat.id;
        setCurrentChatId(activeChatId);
        onChatIdChange?.(activeChatId);
      } catch (error) {
        toast.error("Erro ao criar chat");
        return;
      }
    }

    // Marcar documento no chat antes de enviar mensagem
    try {
      await chatService.markDocumentInChat(workspaceId, activeChatId, documentId);
      toast.success("Documento marcado no chat");
    } catch (error: any) {
      // Se o documento já estiver marcado, não é um erro crítico
      if (error?.statusCode !== 400) {
        console.error("Erro ao marcar documento:", error);
        toast.error("Erro ao marcar documento no chat");
      }
    }

    // Enviar mensagem com contexto do documento
    const contextMessage = `Por favor, analise o documento "${documentName}" e me ajude com ele.`;
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: contextMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Stream da resposta da IA
      const stream = await chatService.streamChat(workspaceId, activeChatId, contextMessage);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantMessageId = (Date.now() + 1).toString();
      let buffer = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event === 'content_chunk' && data.data?.content) {
                assistantMessage += data.data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessage }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.debug('SSE line não é JSON válido:', line);
            }
          }
        }
      }
      
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.event === 'content_chunk' && data.data?.content) {
            assistantMessage += data.data.content;
          }
        } catch (e) {
          // Ignorar
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro ao processar sua mensagem. Por favor, tente novamente.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Erro ao processar sua mensagem. Por favor, tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, createChatMutation, onChatIdChange, workspaceId, isLoading]);

  // Expor função via ref
  React.useEffect(() => {
    if (onDocumentContextRef) {
      onDocumentContextRef.current = handleDocumentContext;
    }

    return () => {
      if (onDocumentContextRef) {
        onDocumentContextRef.current = null;
      }
    };
  }, [onDocumentContextRef, handleDocumentContext]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
            </div>
          </div>
        </div>
        
        {/* Documentos Marcados */}
        {currentChatId && markedDocuments.length > 0 && (
          <div className="px-4 pb-3 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Documentos marcados:</span>
              {markedDocuments.map((doc: any) => (
                <Badge
                  key={doc.id}
                  variant="secondary"
                  className="flex items-center gap-1.5 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">{doc.name}</span>
                  <button
                    onClick={async () => {
                      try {
                        await unmarkDocumentMutation.mutateAsync(doc.id);
                      } catch (error) {
                        console.error('Erro ao desmarcar documento:', error);
                      }
                    }}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    disabled={unmarkDocumentMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Comece uma conversa
              </h2>
              <p className="text-sm text-gray-500 max-w-md">
                Faça uma pergunta ou envie uma mensagem para começar a conversar com a IA.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageAvatar
                  src={
                    message.role === "user"
                      ? "/seloDooorBlack.png"
                      : "/claudeAiSymbol.png"
                  }
                  name={message.role === "user" ? "Você" : "IA"}
                />
                <MessageContent variant="contained">
                  <div className="prose prose-sm max-w-none">
                    {typeof message.content === "string" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div>{message.content}</div>
                    )}
                  </div>
                </MessageContent>
              </Message>
            ))
          )}
          {isLoading && (
            <Message from="assistant">
              <MessageAvatar
                src="/claudeAiSymbol.png"
                name="IA"
              />
              <MessageContent variant="contained">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </MessageContent>
            </Message>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                {/* Adicionar mais ferramentas aqui se necessário */}
              </PromptInputTools>
              <PromptInputSubmit
                status={isLoading ? "submitted" : undefined}
                disabled={!input.trim() || isLoading}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

