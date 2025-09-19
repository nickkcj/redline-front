"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Copy, RotateCcw } from "lucide-react";
import { useCreateChat, useChat } from "@/hooks/use-chat";
import { useCurrentWorkspace } from "@/store/app-store";
import { MessageRole, ChatMessageResponseDto, SendMessageDto } from "@/types/chat";
import { useApiMutation } from "@/hooks/use-api";
import { tokenStore } from "@/lib/auth/stores/auth.store";
import { toast } from "sonner";
import Image from "next/image";
import { ChatBreadcrumb } from "@/components/chat/chat-breadcrumb";
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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentWorkspace = useCurrentWorkspace();
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
  const isStreaming = sendMessageMutation.isPending || createChatMutation.isPending;

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
    setPendingUserMessage(text.trim());

    try {
      // Se não temos um chat, criar um novo
      if (!currentChatId) {
        const newChat = await createChatMutation.mutateAsync({
          title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          initialMessage: text
        });
        setCurrentChatId(newChat.id);
        return;
      }

      // Enviar mensagem para o chat existente
      const result = await sendMessageMutation.mutateAsync({
        content: text.trim(),
        role: MessageRole.USER
      });
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Erro ao enviar mensagem');
      setPendingUserMessage(null);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setInput('');
    setPendingUserMessage(null);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setPendingUserMessage(null);
  };

  // Limpar mensagem pendente quando novas mensagens chegam
  useEffect(() => {
    if (messages.length > 0 && pendingUserMessage) {
      // Verificar se a última mensagem do usuário é a mesma que está pendente
      const lastUserMessage = messages.filter(m => m.role === MessageRole.USER).pop();
      if (lastUserMessage && lastUserMessage.content === pendingUserMessage) {
        setPendingUserMessage(null);
      }
    }
  }, [messages, pendingUserMessage]);

  return (
    <div>
      <ChatBreadcrumb
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId || undefined}
      />
      <div className="h-[90vh] flex flex-col min-h-0 overflow-y-hidden">
        {/* Se temos mensagens ou mensagem pendente, mostrar o chat */}
        {messages.length > 0 || pendingUserMessage ? (
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
                          Analisando sua pergunta e estruturando a melhor resposta...
                        </ReasoningContent>
                      </Reasoning>
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
