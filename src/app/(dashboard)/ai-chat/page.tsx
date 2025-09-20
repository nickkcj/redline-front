"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Copy, RotateCcw } from "lucide-react";
import { useCreateChat, useChat } from "@/hooks/use-chat";
import { useCurrentWorkspace } from "@/store/app-store";
import { MessageRole, ChatMessageResponseDto, SendMessageDto } from "@/types/chat";
import { useApiMutation } from "@/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStore } from "@/lib/auth/stores/auth.store";
import { toast } from "sonner";
import Image from "next/image";
import { ChatBreadcrumb } from "@/components/chat/chat-breadcrumb";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent
} from "@/components/ai-elements/reasoning";
import {
  Message,
  MessageContent,
  MessageAvatar
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Actions,
  Action
} from "@/components/ai-elements/actions";
import { useTheme } from "next-themes";
import { useStreamChat } from "@/hooks/use-stream-chat";

type ModelKey = "claude" | "gemini" | "gpt";

const MODEL_CONFIG = {
  claude: {
    key: "claude" as ModelKey,
    name: "Claude 4 Sonnet",
    icon: "/Claude_AI_symbol.svg.png",
  },
  gemini: {
    key: "gemini" as ModelKey,
    name: "Gemini 2.5 Pro",
    icon: "/Gemini-Icon.png.webp",
  },
  gpt: {
    key: "gpt" as ModelKey,
    name: "GPT-5",
    icon: "/ChatGPT-Logo.svg.png",
  },
};

export default function AiChatPage() {
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState<ModelKey>("claude");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showLoadingDots, setShowLoadingDots] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  const [reasoningContent, setReasoningContent] = useState<string>("");
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentWorkspace = useCurrentWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debug inicial
  console.log('🔎 Initial render:', {
    searchParams: searchParams?.toString(),
    allParams: searchParams ? Object.fromEntries(searchParams.entries()) : 'null',
    chatIdParam: searchParams?.get('chatId'),
    currentChatId
  });

  // Refs para valores atuais (evitar closure stale)
  const currentWorkspaceRef = useRef(currentWorkspace);
  const currentChatIdRef = useRef(currentChatId);
  const queryClient = useQueryClient();
  const docsCount = 156; // Mock document count

  // Hooks para API
  const createChatMutation = useCreateChat(currentWorkspace?.id || '');

  const { data: chatData, isLoading: isLoadingChat, error: chatError } = useChat(
    currentWorkspace?.id || '',
    currentChatId || '',
  );

  const sendMessageMutation = useApiMutation<ChatMessageResponseDto, { content: string; role: MessageRole }>(
    async (data) => {
      if (!currentWorkspace?.id || !currentChatId) {
        throw new Error('Workspace ou Chat ID não encontrado');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const accessToken = tokenStore.getAccessToken();

      console.log('Sending request to:', `${API_BASE_URL}/chats/${currentWorkspace.id}/${currentChatId}/messages`);
      console.log('With token:', accessToken ? 'Token present' : 'No token');
      console.log('Data:', data);

      const response = await fetch(`${API_BASE_URL}/chats/${currentWorkspace.id}/${currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Response error:', errorData);
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      return result;
    },
    {
      showSuccessToast: false,
      invalidateKeys: currentWorkspace?.id && currentChatId ? [
        ['chat', currentWorkspace.id, currentChatId],
        ['chat-messages', currentWorkspace.id, currentChatId],
        ['chats', currentWorkspace.id]
      ] : [],
    }
  );

  const messages = chatData?.messages || [];

  // Stream chat hook
  const {
    isStreaming: isStreamingChat,
    streamingContent,
    startStream,
    stopStream,
    clearStreamingContent,
  } = useStreamChat({
    onStreamStart: () => {
      setShowLoadingDots(true);
      setStreamingResponse("");
      setReasoningContent("Analisando sua pergunta e iniciando o processamento...");
    },
    onChunk: (content: string) => {
      console.log('📝 Received chunk:', content);
      setReasoningContent("Gerando resposta...");
    },
    onStreamEnd: (fullResponse: string) => {
      setShowLoadingDots(false);
      setStreamingResponse("");
      setReasoningContent("");

      console.log('🎯 onStreamEnd called with:', {
        fullResponse: fullResponse?.substring(0, 50) + '...',
        currentWorkspaceId: currentWorkspaceRef.current?.id,
        currentChatId: currentChatIdRef.current,
        hasWorkspace: !!currentWorkspaceRef.current?.id,
        hasChatId: !!currentChatIdRef.current
      });

      // Invalidate queries to refresh the chat e remove mensagem pendente depois
      if (currentWorkspaceRef.current?.id && currentChatIdRef.current) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['chat', currentWorkspaceRef.current.id, currentChatIdRef.current]
          }),
          queryClient.invalidateQueries({
            queryKey: ['chats', currentWorkspaceRef.current.id]
          })
        ]).then(() => {
          // Aguarda um pouco para garantir que os dados foram carregados
          setTimeout(() => {
            console.log('🔴 Clearing pendingUserMessage after stream end');
            setPendingUserMessage(null);
            clearStreamingContent(); // Limpa conteúdo streaming junto
          }, 100);
        });
      } else {
        // Se não tiver workspace/chat, remove imediatamente
        console.log('🔴 Clearing pendingUserMessage (no workspace/chat)');
        setPendingUserMessage(null);
      }
    },
    onError: (error) => {
      setShowLoadingDots(false);
      setStreamingResponse("");
      setReasoningContent("");
      console.log('🔴 Clearing pendingUserMessage (stream error)');
      setPendingUserMessage(null); // Remove mensagem pendente também em caso de erro
      clearStreamingContent(); // Limpa streaming content em caso de erro
      toast.error(`Erro no streaming: ${error.message}`);
    },
    onMessageSaved: (messageId, role, content) => {
      // Não remove a mensagem pendente do usuário aqui
      // Ela só será removida quando o streaming terminar completamente
    },
  });

  const isStreaming = sendMessageMutation.isPending || createChatMutation.isPending || isStreamingChat;

  // Debug streaming content
  useEffect(() => {
    console.log('🎬 Streaming content updated:', streamingContent, 'Length:', streamingContent?.length);
  }, [streamingContent]);

  // Debug streaming state
  useEffect(() => {
    console.log('🎯 isStreamingChat state:', isStreamingChat);
  }, [isStreamingChat]);

  // Limpa streaming content quando muda de chat (mas preserva pendingUserMessage)
  useEffect(() => {
    clearStreamingContent();
    setShowLoadingDots(false);
    setStreamingResponse("");
    setReasoningContent("");
    // NÃO limpa pendingUserMessage aqui - pode estar sendo usada
  }, [currentChatId, clearStreamingContent]);

  // Controlar dots de loading
  useEffect(() => {
    if (isStreaming) {
      setShowLoadingDots(true);
    } else {
      // Delay para esconder os dots apenas quando uma nova mensagem realmente chegar
      const timer = setTimeout(() => {
        setShowLoadingDots(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  // Detectar quando novas mensagens chegam para esconder dots imediatamente
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      setShowLoadingDots(false);
      setLastMessageCount(messages.length);
    }
  }, [messages.length, lastMessageCount]);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingUserMessage]);

  // Auto scroll durante streaming - suave e performático
  useEffect(() => {
    if (streamingContent && messagesEndRef.current) {
      // Usa requestAnimationFrame para scroll mais suave
      const scrollToBottom = () => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        });
      };

      // Debounce scroll para não ser muito agressivo
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [streamingContent]);

  // Debug logs (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Chat state:', {
        chatId: currentChatId,
        messagesCount: messages.length,
        pendingMessage: pendingUserMessage,
        isStreaming
      });
    }
  }, [currentChatId, messages.length, pendingUserMessage, isStreaming]);

  // Debug pendingUserMessage changes specifically
  useEffect(() => {
    console.log('🔵 pendingUserMessage changed:', pendingUserMessage);
  }, [pendingUserMessage]);

  // Atualizar refs para evitar closure stale
  useEffect(() => {
    currentWorkspaceRef.current = currentWorkspace;
  }, [currentWorkspace]);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Flag para evitar loop na primeira leitura da URL
  const hasInitialized = useRef(false);

  // Ler chatId da URL e recarregar no chat
  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId');
    console.log('🔍 URL check:', { chatIdFromUrl, currentChatId, hasInitialized: hasInitialized.current, searchParams: searchParams.toString() });

    // Se tem chatId na URL e ainda não inicializou, ou se o chatId mudou (navegação)
    if (chatIdFromUrl && (!hasInitialized.current || chatIdFromUrl !== currentChatId)) {
      console.log('📖 Setting chat ID from URL:', chatIdFromUrl);
      setCurrentChatId(chatIdFromUrl);
      hasInitialized.current = true;
    } else if (!chatIdFromUrl && hasInitialized.current && currentChatId) {
      // URL foi limpa (usuário navegou para /ai-chat sem chatId)
      console.log('🗑️ URL cleared, clearing current chat');
      setCurrentChatId(null);
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;
    }
  }, [searchParams]); // Monitora mudanças na URL

  // Função para atualizar URL com chatId (preservando outros parâmetros)
  const updateUrlWithChatId = useCallback((chatId: string | null) => {
    console.log('🔧 updateUrlWithChatId called with:', chatId);

    const currentParams = new URLSearchParams(window.location.search);

    if (chatId) {
      currentParams.set('chatId', chatId);
      console.log('🔗 Adding chatId to URL:', chatId);
    } else {
      currentParams.delete('chatId');
      console.log('🗑️ Removing chatId from URL');
    }

    const newUrl = currentParams.toString() ? `?${currentParams.toString()}` : '';
    console.log('🌐 New URL will be:', `/ai-chat${newUrl}`);
    router.replace(`/ai-chat${newUrl}`, { scroll: false });
  }, [router]);

  // Debug condição de exibição do chat
  const shouldShowChat = messages.length > 0 || pendingUserMessage || currentChatId;
  console.log('🖥️ Should show chat:', {
    shouldShowChat,
    messagesLength: messages.length,
    pendingUserMessage: !!pendingUserMessage,
    currentChatId: !!currentChatId
  });

  const handleQuickAction = (prompt: string) => {
    setInput("");
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (text: string) => {
    console.log("Sending message:", text, "with model:", currentModel);

    if (!text.trim()) {
      return;
    }

    if (isStreaming) {
      return;
    }

    if (!currentWorkspace?.id) {
      toast.error('Workspace não encontrado');
      return;
    }

    // Mostrar mensagem do usuário imediatamente
    console.log('🟢 Setting pendingUserMessage:', text.trim());
    setPendingUserMessage(text.trim());

    try {
      // Se não temos um chat, criar um novo
      if (!currentChatId) {
        const newChat = await createChatMutation.mutateAsync({
          title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          initialMessage: text
        });
        setCurrentChatId(newChat.id);
        updateUrlWithChatId(newChat.id); // Adiciona novo chatId à URL
        return;
      }

      // Use streaming para chat existente
      console.log('Starting stream with:', { workspaceId: currentWorkspace.id, chatId: currentChatId, content: text.trim() });

      try {
        await startStream(currentWorkspace.id, currentChatId, text.trim());
      } catch (streamError) {
        console.error('Streaming failed, falling back to normal message:', streamError);
        // Fallback para o método normal se streaming falhar
        const result = await sendMessageMutation.mutateAsync({
          content: text.trim(),
          role: MessageRole.USER
        });
      }

    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Erro ao enviar mensagem');
      console.log('🔴 Clearing pendingUserMessage (general error)');
      setPendingUserMessage(null);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    updateUrlWithChatId(null); // Remove chatId da URL
    setInput('');
    console.log('🔴 Clearing pendingUserMessage (new chat)');
    setPendingUserMessage(null);
    // Limpa streaming content quando cria novo chat
    clearStreamingContent();
    setShowLoadingDots(false);
    setStreamingResponse("");
    setReasoningContent("");
  };

  const handleSelectChat = (chatId: string) => {
    console.log('🎯 handleSelectChat called with:', chatId, 'current:', currentChatId);
    setCurrentChatId(chatId);
    updateUrlWithChatId(chatId); // Atualiza URL explicitamente
    // O useEffect já vai limpar o streaming content
    // Só limpa pendingUserMessage se estivermos realmente mudando de chat
    if (chatId !== currentChatId) {
      console.log('🔴 Clearing pendingUserMessage (chat selection change)');
      setPendingUserMessage(null);
    }
  };

  // Limpar mensagem pendente quando novas mensagens chegam
  useEffect(() => {
    if (messages.length > 0 && pendingUserMessage) {
      // Verificar se a última mensagem do usuário é a mesma que está pendente
      const lastUserMessage = messages.filter(m => m.role === MessageRole.USER).pop();
      console.log('🔍 Checking if pending message matches last user message:', {
        pendingUserMessage,
        lastUserMessage: lastUserMessage?.content,
        matches: lastUserMessage && lastUserMessage.content === pendingUserMessage,
        messagesLength: messages.length,
        allUserMessages: messages.filter(m => m.role === MessageRole.USER).map(m => m.content)
      });
      if (lastUserMessage && lastUserMessage.content === pendingUserMessage) {
        console.log('🔴 Clearing pendingUserMessage (message found in chat)');
        setPendingUserMessage(null);

        // Se temos streaming content, limpar também para evitar duplicação da resposta da IA
        if (streamingContent) {
          console.log('🧹 Clearing streaming content to avoid AI response duplication');
          clearStreamingContent();
        }
      }
    }
  }, [messages, pendingUserMessage, streamingContent, clearStreamingContent]);

  return (
    <div>
      <ChatBreadcrumb
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId || undefined}
      />
      <div className="h-[90vh] flex flex-col min-h-0 overflow-y-hidden">
        {/* Se temos mensagens, mensagem pendente, ou chat selecionado, mostrar o chat */}
        {shouldShowChat ? (
          <>
            {/* Área de Mensagens - com scroll independente */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <div className="space-y-8 max-w-4xl mx-auto">
                  {isLoadingChat && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Carregando...</div>
                    </div>
                  )}

                  {chatError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="text-destructive text-sm">Erro ao carregar chat</div>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div key={message.id} className="space-y-4">
                      {message.role === MessageRole.ASSISTANT && (
                        <Reasoning isStreaming={false} defaultOpen={false} duration={Math.floor(Math.random() * 4) + 1}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            Analisei cuidadosamente sua pergunta, considerei diferentes perspectivas e estruturei uma resposta abrangente para atender às suas necessidades específicas.
                          </ReasoningContent>
                        </Reasoning>
                      )}

                      <Message from={message.role}>
                        {message.role === MessageRole.ASSISTANT && (
                          <MessageAvatar
                            src=""
                            name="AI"
                          />
                        )}
                        <MessageContent variant={message.role === MessageRole.USER ? "contained" : "flat"}>
                          <Response>
                            {message.content}
                          </Response>
                        </MessageContent>
                        {message.role === MessageRole.USER && (
                          <MessageAvatar
                            src=""
                            name="You"
                          />
                        )}
                      </Message>

                      {message.role === MessageRole.ASSISTANT && (
                        <Actions className="ml-10">
                          <Action
                            tooltip="Copy message"
                            label="Copy"
                            onClick={() => navigator.clipboard.writeText(message.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Action>
                          <Action
                            tooltip="Regenerate response"
                            label="Regenerate"
                            onClick={() => console.log('Regenerate message')}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Action>
                        </Actions>
                      )}

                      {message.role === MessageRole.ASSISTANT && message.aiModel && (
                        <div className="ml-10 flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <span>{message.aiModel}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Mensagem pendente do usuário */}
                  {pendingUserMessage && (
                    <Message from="user">
                      <MessageContent>
                        <Response>
                          {pendingUserMessage}
                        </Response>
                      </MessageContent>
                      <MessageAvatar
                        src=""
                        name="You"
                      />
                    </Message>
                  )}

                  {showLoadingDots && (
                    <div className="w-full mb-4">
                      <Reasoning isStreaming={showLoadingDots} defaultOpen={true}>
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {reasoningContent || "Analisando sua pergunta e estruturando a melhor resposta..."}
                        </ReasoningContent>
                      </Reasoning>
                    </div>
                  )}

                  {/* Resposta sendo transmitida em tempo real */}
                  {streamingContent && (
                    <div className="w-full mb-4">
                      <Message from="assistant">
                        <MessageAvatar
                          src=""
                          name="AI"
                        />
                        <MessageContent variant="flat">
                          <Response>
                            {streamingContent}
                          </Response>
                        </MessageContent>
                      </Message>
                    </div>
                  )}

                  {/* Fallback dots caso o Reasoning não apareça */}
                  {isStreaming && !showLoadingDots && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center gap-1 p-4 bg-muted/50 rounded-lg">
                        <span className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0s' }}></span>
                        <span className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0.15s' }}></span>
                        <span className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input fixo na parte inferior - com linha divisória */}
            <div className="border-t bg-background p-6">
              <div className="max-w-4xl mx-auto">
                <PromptInput
                  onSubmit={(message, e) => {
                    e.preventDefault();
                    const text = message.text?.trim();
                    if (!text) return;
                    setInput("");
                    handleSendMessage(text);
                  }}
                  className="relative"
                >
                  <PromptInputTextarea
                    ref={inputRef as any}
                    placeholder="Ask or find anything from your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-base"
                  />
                  <PromptInputToolbar>
                    <PromptInputTools>
                      <PromptInputModelSelect value={currentModel} onValueChange={(value) => setCurrentModel(value as ModelKey)}>
                        <PromptInputModelSelectTrigger>
                          <div className="flex items-center gap-2">
                            <Image
                              src={MODEL_CONFIG[currentModel].icon}
                              alt={MODEL_CONFIG[currentModel].name}
                              width={16}
                              height={16}
                              className="rounded"
                            />
                            <span className="hidden sm:inline">
                              {MODEL_CONFIG[currentModel].name}
                            </span>
                          </div>
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {Object.values(MODEL_CONFIG).map((model) => (
                            <PromptInputModelSelectItem key={model.key} value={model.key}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={model.icon}
                                  alt={model.name}
                                  width={16}
                                  height={16}
                                  className="rounded"
                                />
                                {model.name}
                              </div>
                            </PromptInputModelSelectItem>
                          ))}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    </PromptInputTools>
                    <PromptInputSubmit
                      disabled={!input.trim()}
                    />
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
          </>
        ) : (
          /* Interface inicial quando não há mensagens */
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Welcome Section */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                How can I help you today?
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Ask me anything about the {docsCount} documents in this data room
              </p>
            </div>

            {/* Quick Actions */}
            {docsCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Summarize the key points from all documents")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  📄 Summarize documents
                </div>
                <div className="text-sm text-muted-foreground">
                  Get an overview of all documents
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("What are the main topics covered in these documents?")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  🔍 Explore topics
                </div>
                <div className="text-sm text-muted-foreground">
                  Discover key themes and topics
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Find all mentions of financial data and create a summary")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  💰 Financial insights
                </div>
                <div className="text-sm text-muted-foreground">
                  Extract financial information
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Identify any risks or concerns mentioned in the documents")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  ⚠️ Risk analysis
                </div>
                <div className="text-sm text-muted-foreground">
                  Identify potential risks
                </div>
              </div>
            </Button>
              </div>
            )}

            {/* Input na tela inicial */}
            <div className="w-full max-w-4xl mx-auto">
              <PromptInput
                onSubmit={(message, e) => {
                  e.preventDefault();
                  const text = message.text?.trim();
                  if (!text) return;
                  setInput("");
                  handleSendMessage(text);
                }}
                className="relative"
              >
                <PromptInputTextarea
                  ref={inputRef as any}
                  placeholder="Ask or find anything from your documents..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-base"
                />
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputModelSelect value={currentModel} onValueChange={(value) => setCurrentModel(value as ModelKey)}>
                      <PromptInputModelSelectTrigger>
                        <div className="flex items-center gap-2">
                          <Image
                            src={MODEL_CONFIG[currentModel].icon}
                            alt={MODEL_CONFIG[currentModel].name}
                            width={16}
                            height={16}
                            className="rounded"
                          />
                          <span className="hidden sm:inline">
                            {MODEL_CONFIG[currentModel].name}
                          </span>
                        </div>
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent>
                        {Object.values(MODEL_CONFIG).map((model) => (
                          <PromptInputModelSelectItem key={model.key} value={model.key}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={model.icon}
                                alt={model.name}
                                width={16}
                                height={16}
                                className="rounded"
                              />
                              {model.name}
                            </div>
                          </PromptInputModelSelectItem>
                        ))}
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
                  </PromptInputTools>
                  <PromptInputSubmit
                    disabled={!input.trim()}
                  />
                </PromptInputToolbar>
              </PromptInput>

              {/* Additional Help Text */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send,
                  <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> for new line
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
