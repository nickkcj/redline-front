"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatCircle, Trash, Sparkle, DotsThree, Plus, Robot, ClockCounterClockwise } from "@phosphor-icons/react";
import { useChats, useDeleteChat } from "@/hooks/api/use-chat";
import { useCurrentWorkspace } from "@/lib/stores/app.store";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHistoryListProps {
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
}

export function ChatHistoryList({
  onSelectChat,
  currentChatId
}: ChatHistoryListProps) {
  const currentWorkspace = useCurrentWorkspace();
  const router = useRouter();

  const { data: chatsData, isLoading } = useChats(
    currentWorkspace?.id || '',
    { page: 1, limit: 50 }
  );

  const deleteChat = useDeleteChat(currentWorkspace?.id || '');

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChat.mutateAsync(chatId);
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  // No mock data - use real API data only
  const chats = chatsData?.chats || [];

  // Group chats by date periods
  const groupedChats = useMemo(() => {
    if (chats.length === 0) return {};

    const groups: Record<string, typeof chats> = {
      'Hoje': [],
      'Ontem': [],
      'Esta semana': [],
      'Anteriormente': []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups['Hoje'].push(chat);
      } else if (isYesterday(chatDate)) {
        groups['Ontem'].push(chat);
      } else if (isThisWeek(chatDate, { weekStartsOn: 0 })) {
        groups['Esta semana'].push(chat);
      } else {
        groups['Anteriormente'].push(chat);
      }
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([_, chats]) => chats.length > 0)
    );
  }, [chats]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-4 py-3 shrink-0">
          <span className="text-sm font-medium">Chats</span>
        </div>
        <div className="px-2 pb-2 flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 px-2 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            title="New Chat"
            onClick={() => onSelectChat?.('new')}
          >
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center flex-1">
          <ChatCircle weight="fill" className="w-8 h-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma conversa iniciada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 shrink-0">
        <span className="text-sm font-medium">Chats</span>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-9 px-2 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            title="New Chat" 
            onClick={() => onSelectChat?.('new')}
          >
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-9 px-2 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            title="History"
          >
            <ClockCounterClockwise weight="bold" className="mr-2 h-4 w-4" />
            <span>History</span>
          </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pb-2">
          <div className="space-y-[1px]">
            {Object.entries(groupedChats).map(([groupName, chats]) => (
            <div key={groupName} className="space-y-[1px]">
              <h3 className="px-2 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1 mt-2">
                {groupName}
              </h3>

              <div className="space-y-[1px]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-colors text-sm ${
                      currentChatId === chat.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80'
                    }`}
                    onClick={() => onSelectChat?.(chat.id)}
                  >
                    <div className="opacity-70 shrink-0">
                      <ChatCircle weight="bold" className="w-3.5 h-3.5" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="relative flex-1 min-w-0">
                        <span className="block truncate text-xs pr-4">
                          {chat.title || 'Nova conversa'}
                        </span>
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-sidebar to-transparent pointer-events-none group-hover:from-sidebar-accent/50" />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-xs"
                          >
                            <DotsThree weight="bold" className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem 
                            className="text-xs text-destructive focus:text-destructive"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                          >
                            <Trash weight="bold" className="w-3.5 h-3.5 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
    </div>
  );
}
