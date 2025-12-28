"use client";

import { useState } from "react";
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
import { History, MessageSquare, Calendar, Trash2 } from "lucide-react";
import { useChats, useDeleteChat } from "@/hooks/api/use-chat";
import { useCurrentWorkspace } from "@/lib/stores/app.store";
import { formatDistanceToNow } from "date-fns";
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

      <SheetContent side="left" className="w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Histórico de Chats
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Carregando...</div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-destructive text-sm">Erro ao carregar chats</div>
            </div>
          )}

          {!isLoading && !error && (!chatsData?.chats || chatsData.chats.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum chat encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Inicie uma conversa para ver o histórico aqui
              </p>
            </div>
          )}

          {chatsData?.chats && chatsData.chats.length > 0 && (
            <div className="space-y-3">
              {chatsData.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer ${
                    currentChatId === chat.id ? 'bg-accent border-primary' : ''
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {chat.title || 'Chat sem título'}
                      </h4>

                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(chat.createdAt)}
                        </span>

                        <Badge
                          variant={chat.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {chat.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar Chat</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar este chat? Esta ação não pode ser desfeita.
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
          )}

          {chatsData && chatsData.total > chatsData.chats.length && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {chatsData.chats.length} de {chatsData.total} chats
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}