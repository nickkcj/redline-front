"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { History, MessageSquare, Calendar, Trash2, Sparkles } from "lucide-react";
import { useChats, useDeleteChat } from "@/hooks/api/use-chat";
import { useCurrentWorkspace } from "@/lib/stores/app.store";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, startOfToday, startOfYesterday, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHistorySheetProps {
  trigger?: React.ReactNode;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
}

export function ChatHistorySheet({
  trigger,
  onSelectChat,
  currentChatId
}: ChatHistorySheetProps) {
  const [open, setOpen] = useState(false);
  const currentWorkspace = useCurrentWorkspace();

  const { data: chatsData, isLoading, error } = useChats(
    currentWorkspace?.id || '',
    { page: 1, limit: 50 }
  );

  const deleteChat = useDeleteChat(currentWorkspace?.id || '');

  const handleSelectChat = (chatId: string) => {
    onSelectChat?.(chatId);
    setOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat.mutateAsync(chatId);
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  // Group chats by date periods
  const groupedChats = useMemo(() => {
    if (!chatsData?.chats) return {};

    const groups: Record<string, typeof chatsData.chats> = {
      'Hoje': [],
      'Ontem': [],
      'Esta semana': [],
      'Mais antigos': []
    };

    chatsData.chats.forEach(chat => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups['Hoje'].push(chat);
      } else if (isYesterday(chatDate)) {
        groups['Ontem'].push(chat);
      } else if (isThisWeek(chatDate, { weekStartsOn: 0 })) {
        groups['Esta semana'].push(chat);
      } else {
        groups['Mais antigos'].push(chat);
      }
    });

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, chats]) => chats.length > 0)
    );
  }, [chatsData]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
        </SheetTrigger>
      )}

      <SheetContent side="left" className="w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b bg-muted/30">
          <SheetTitle className="flex items-center gap-2.5 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <span>Histórico de Conversas</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-3" />
                <div className="text-sm text-muted-foreground">Carregando conversas...</div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="text-destructive text-sm font-medium">Erro ao carregar chats</div>
                <div className="text-destructive/80 text-xs mt-1">Tente novamente mais tarde</div>
              </div>
            )}

            {!isLoading && !error && (!chatsData?.chats || chatsData.chats.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">Nenhuma conversa ainda</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Inicie uma nova conversa e ela aparecerá aqui
                </p>
              </div>
            )}

            {!isLoading && !error && Object.keys(groupedChats).length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedChats).map(([groupName, chats]) => (
                  <div key={groupName} className="space-y-2">
                    <div className="px-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {groupName}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`group relative p-3 rounded-lg hover:bg-accent/80 transition-all cursor-pointer ${
                            currentChatId === chat.id ? 'bg-accent/60 ring-1 ring-primary/20' : ''
                          }`}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              {chat.title === 'Nova conversa...' || chat.title === 'New Chat' ? (
                                <MessageSquare className="w-4 h-4 text-primary/60" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-primary" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate mb-0.5">
                                {chat.title || 'Chat sem título'}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatDate(chat.createdAt)}</span>
                                {!chat.isActive && (
                                  <>
                                    <span>•</span>
                                    <span className="text-muted-foreground/60">Inativo</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deletar conversa?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. A conversa e todas as mensagens serão permanentemente removidas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteChat(chat.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {chatsData && chatsData.total > chatsData.chats.length && (
              <div className="text-center py-4 mt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Mostrando {chatsData.chats.length} de {chatsData.total} conversas
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}