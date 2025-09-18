"use client";

import { PropsWithChildren, useRef, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCreateChat, useChat } from "@/hooks/use-chat";
import { useApiMutation } from "@/hooks/use-api";
import { useCurrentWorkspace } from "@/store/app-store";
import { MessageRole, ChatMessageResponseDto, SendMessageDto } from "@/types/chat";
import { toast } from "sonner";

type ChatSheetProps = PropsWithChildren<{
  /** Deixe undefined para não ter trigger visual */
  trigger?: React.ReactNode;
  /** ID do chat existente - se não fornecido, criará um novo */
  chatId?: string;
}>;

export function ChatSheet({ trigger, chatId: initialChatId }: ChatSheetProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(initialChatId || null);

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
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Chat</SheetTitle>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = input.trim();
              if (!value) return;
              sendMessage(value);
              setInput("");
            }}
            className="flex gap-2 border-t p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              autoFocus
              disabled={isStreaming}
            />
            <Button disabled={isStreaming || !currentWorkspace?.id}>
              {isStreaming ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}