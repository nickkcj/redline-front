"use client";

import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";
import { ChatHistorySheet } from "./chat-history-sheet";

interface ChatHeaderProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
  title?: string;
}

export function ChatHeader({
  onNewChat,
  onSelectChat,
  currentChatId,
  title = "AI Chat"
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ChatHistorySheet
          onSelectChat={onSelectChat}
          currentChatId={currentChatId}
          trigger={
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
          }
        />

        <Button
          onClick={onNewChat}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Chat
        </Button>
      </div>
    </div>
  );
}