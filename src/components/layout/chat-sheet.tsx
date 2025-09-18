"use client";

import { PropsWithChildren, useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
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
import { useCreateChat, useChat } from "@/hooks/use-chat";
import { useApiMutation } from "@/hooks/use-api";
import { useCurrentWorkspace } from "@/store/app-store";
import { MessageRole, ChatMessageResponseDto, SendMessageDto } from "@/types/chat";
import { toast } from "sonner";

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

type ChatSheetProps = PropsWithChildren<{
  /** Deixe undefined para não ter trigger visual */
  trigger?: React.ReactNode;
  /** ID do chat existente - se não fornecido, criará um novo */
  chatId?: string;
}>;

export function ChatSheet({ trigger, chatId: initialChatId }: ChatSheetProps) {
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState<ModelKey>("claude");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const currentWorkspace = useCurrentWorkspace();
  const bottomRef = useRef<HTMLDivElement>(null);

  const createChatMutation = useCreateChat(currentWorkspace?.id || '');

  // Criar hook de envio de mensagem manualmente
  const sendMessageMutation = useApiMutation<ChatMessageResponseDto, SendMessageDto>(
    async (data) => {
      if (!currentWorkspace?.id || !currentChatId) {
        throw new Error('Workspace ou Chat ID não encontrado');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/chats/${currentWorkspace.id}/${currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return response.json();
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

  // Debug current workspace
  useEffect(() => {
    console.log('Current workspace changed:', currentWorkspace);
  }, [currentWorkspace]);

  useEffect(() => {
    console.log('Current chatId changed:', currentChatId);
  }, [currentChatId]);

  const { data: chatData, isLoading: isLoadingChat, error: chatError } = useChat(
    currentWorkspace?.id || '',
    currentChatId || '',
  );

  const messages = chatData?.messages || [];
  const isStreaming = sendMessageMutation.isPending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setShowClearDialog(false);
    toast.success("Histórico do chat foi limpo");
  };

  const sendMessage = async (content: string) => {
    console.log('sendMessage called with:', { content, currentWorkspace: currentWorkspace?.id, currentChatId, isStreaming });

    if (!content.trim()) {
      console.log('Empty content, returning');
      return;
    }

    if (isStreaming) {
      console.log('Already streaming, returning');
      return;
    }

    if (!currentWorkspace?.id) {
      console.log('No workspace ID, returning');
      toast.error('Workspace não encontrado');
      return;
    }

    try {
      // Se não temos um chat, criar um novo
      if (!currentChatId) {
        console.log('Creating new chat...');
        const newChat = await createChatMutation.mutateAsync({
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          initialMessage: content
        });
        console.log('New chat created:', newChat);
        setCurrentChatId(newChat.id);
        return;
      }

      // Enviar mensagem para o chat existente
      console.log('Sending message to existing chat:', currentChatId);
      const result = await sendMessageMutation.mutateAsync({
        content: content.trim(),
        role: MessageRole.USER
      });
      console.log('Message sent successfully:', result);
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Erro ao enviar mensagem');
    }
  };

  // Abrir via evento global
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler as EventListener);
    return () => window.removeEventListener("open-chat", handler as EventListener);
  }, []);

  // Abrir via teclado: Ctrl/⌘ + J
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent side="right" className="w-[420px] p-0">
        <SheetHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <SheetTitle>Chat</SheetTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="h-8 px-2"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </SheetHeader>

        <div className="flex h-full flex-col">
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3 text-sm">
              {chatError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="text-destructive text-sm">Erro ao carregar chat</div>
                </div>
              )}

              {isLoadingChat && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Carregando...</div>
                </div>
              )}

              {!isLoadingChat && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Inicie uma conversa...</div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id}>
                  <div className="mb-1 font-medium">
                    {message.role === MessageRole.USER ? "Você" : "Assistente"}
                  </div>

                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {message.content}
                  </div>

                  <Separator className="my-3" />
                </div>
              ))}

              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Enviando</span>
                  <span className="inline-block w-2 h-4 bg-current animate-pulse" />
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <PromptInput
              onSubmit={(message, e) => {
                e.preventDefault();
                const text = message.text?.trim();
                if (!text) return;
                sendMessage(text);
                setInput("");
              }}
              className="relative"
            >
              <PromptInputTextarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="text-sm min-h-[60px] max-h-[120px]"
                disabled={isStreaming}
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputModelSelect value={currentModel} onValueChange={(value) => setCurrentModel(value as ModelKey)}>
                    <PromptInputModelSelectTrigger>
                      <div className="flex items-center gap-1.5">
                        <Image
                          src={MODEL_CONFIG[currentModel].icon}
                          alt={MODEL_CONFIG[currentModel].name}
                          width={16}
                          height={16}
                          className="rounded"
                        />
                        <span className="hidden sm:inline text-xs">
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
                            <span className="text-sm">{model.name}</span>
                          </div>
                        </PromptInputModelSelectItem>
                      ))}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit
                  disabled={!input.trim() || isStreaming}
                />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </SheetContent>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Histórico do Chat</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Você tem certeza que deseja limpar todo o histórico de conversas?</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Esta ação removerá permanentemente todas as <strong className="text-foreground">{messages.length} mensagens</strong> do chat atual.
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar Histórico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}