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
import { aiService, ChatMessage } from "@/lib/services/ai.service";

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
  /** Slug for the AI endpoint - defaults to "default" */
  slug?: string;
  /** AI provider - defaults to "mock" */
  provider?: string;
}>;

export function ChatSheet({ trigger, slug = "default", provider = "mock" }: ChatSheetProps) {
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState<ModelKey>("claude");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const [open, setOpen] = useState(false);

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setShowClearDialog(false);
    toast.success("Histórico do chat foi limpo");
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setError(null);

    try {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);

      let accumulatedContent = '';

      for await (const chunk of aiService.streamChatCompletions(slug, {
        messages: [...messages, userMessage],
        model: "mock-model",
        stream: true,
        temperature: 0.7
      }, provider)) {
        const content = chunk.choices[0]?.delta.content;
        if (content) {
          accumulatedContent += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter(msg => !(msg.role === 'assistant' && !msg.content)));
    } finally {
      setIsStreaming(false);
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
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="text-destructive text-sm">{error}</div>
                </div>
              )}

              {messages.map((m, index) => (
                <div key={index}>
                  <div className="mb-1 font-medium">
                    {m.role === "user" ? "You" : "Assistant"}
                  </div>

                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {typeof m.content === 'string'
                      ? m.content
                      : Array.isArray(m.content)
                        ? m.content.map(c => c.text).join(' ')
                        : ''
                    }
                    {m.role === "assistant" && isStreaming && index === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                    )}
                  </div>

                  <Separator className="my-3" />
                </div>
              ))}
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