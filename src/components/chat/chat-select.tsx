"use client";

import { History, MessageSquare } from "lucide-react";
import { TrashIcon } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useChats, useDeleteChat } from "@/hooks/use-chat";
import { useCurrentWorkspace } from "@/store/app-store";

// CSS-in-JS para forçar ellipsis
const selectTriggerStyle = {
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const
};

interface ChatSelectProps {
  onSelectChat?: (chatId: string | null) => void;
  currentChatId?: string;
  placeholder?: string;
}

export function ChatSelect({
  onSelectChat,
  currentChatId,
  placeholder = "Selecionar chat..."
}: ChatSelectProps) {
  const currentWorkspace = useCurrentWorkspace();

  const { data: chatsData, isLoading } = useChats(
    currentWorkspace?.id || '',
    { page: 1, limit: 50 }
  );

  const deleteChat = useDeleteChat(currentWorkspace?.id || '');

  const handleValueChange = (value: string) => {
    if (value === "new") {
      // Se selecionou "Novo Chat", limpa o chat atual
      onSelectChat?.(null);
    } else {
      onSelectChat?.(value);
    }
  };

  const getCurrentChatTitle = () => {
    if (!currentChatId) return null;
    const currentChat = chatsData?.chats?.find(chat => chat.id === currentChatId);
    return currentChat?.title || 'Chat sem título';
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await deleteChat.mutateAsync(chatId);
      // Se o chat deletado é o atual, limpa a seleção
      if (chatId === currentChatId) {
        onSelectChat?.(null);
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  return (
    <Select
      value={currentChatId || ""}
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        className="w-[280px] overflow-hidden [&_span[data-radix-select-value]]:!text-ellipsis [&_span[data-radix-select-value]]:!overflow-hidden [&_span[data-radix-select-value]]:!whitespace-nowrap [&_span[data-radix-select-value]]:!max-w-[200px] [&_span[data-radix-select-value]]:!block"
        style={selectTriggerStyle}
      >
        <div className="flex items-center gap-2 w-full min-w-0">
          <History className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <SelectValue placeholder={placeholder} />
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        

        {isLoading && (
          <SelectItem value="loading" disabled>
            Carregando chats...
          </SelectItem>
        )}

        {!isLoading && chatsData?.chats && chatsData.chats.length > 0 && (
          <>
            {chatsData.chats.map((chat) => (
              <div key={chat.id} className="relative group">
                <SelectItem value={chat.id} className="pr-8">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {chat.isActive ? '●' : '○'}
                    </span>
                    <span className="truncate flex-1">
                      {chat.title || 'Chat sem título'}
                    </span>
                  </div>
                </SelectItem>

                {/* Lixeira na posição exata onde fica o check mark do Radix - só aparece no hover */}
                {chat.id !== currentChatId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="absolute right-2 cursor-pointer top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-red-500 hover:text-red-600 rounded-sm transition-colors z-20 opacity-0 group-hover:opacity-100 pointer-events-auto"
                        style={{ color: '#ef4444' }}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
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
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </>
        )}

        {!isLoading && (!chatsData?.chats || chatsData.chats.length === 0) && (
          <SelectItem value="empty" disabled>
            Nenhum chat encontrado
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}