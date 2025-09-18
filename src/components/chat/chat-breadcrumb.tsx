"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Plus, History } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChatHistorySheet } from "./chat-history-sheet";

interface ChatBreadcrumbProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
}

export function ChatBreadcrumb({
  onNewChat,
  onSelectChat,
  currentChatId
}: ChatBreadcrumbProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>AI Chat</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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