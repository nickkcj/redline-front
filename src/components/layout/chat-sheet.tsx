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
import { aiService, ChatMessage } from "@/lib/services/ai.service";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const [open, setOpen] = useState(false);

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
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Chat</SheetTitle>
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
            <Button disabled={isStreaming}>
              {isStreaming ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}