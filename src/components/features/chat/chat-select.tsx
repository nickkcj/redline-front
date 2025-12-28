"use client";

import { History, MessageSquare } from "lucide-react";
import { TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
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
import { useChats, useDeleteChat } from "@/hooks/api/use-chat";
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
  const [selectOpen, setSelectOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

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

  const handleOpenDeleteDialog = (chatId: string) => {
    console.log('🗑️ Opening delete dialog for chat:', chatId);
    setChatToDelete(chatId);
    setSelectOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    console.log('🔥 handleDeleteChat called with chatId:', chatToDelete);

    // Fecha o dialog primeiro
    setDeleteDialogOpen(false);

    // Mostra toast de loading manual para debug
    const loadingToast = toast.loading('Deletando chat...');

    try {
      console.log('🚀 Starting delete mutation...');
      const result = await deleteChat.mutateAsync(chatToDelete);
      console.log('🎯 Delete mutation result:', result);

      // Se o chat deletado é o atual, limpa a seleção
      if (chatToDelete === currentChatId) {
        console.log('🧹 Clearing current chat selection...');
        onSelectChat?.(null);
      }

      console.log('✅ Delete successful!');

      // Remove loading e mostra sucesso manual para debug
      toast.dismiss(loadingToast);
      toast.success('Chat deletado com sucesso! (manual)');
    } catch (error) {
      console.error('❌ Erro ao deletar chat:', error);

      // Remove loading e mostra erro manual para debug
      toast.dismiss(loadingToast);
      toast.error('Erro ao deletar chat: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setChatToDelete(null);
    }
  };

  return (
    <>
      <Select
        value={currentChatId || ""}
        onValueChange={handleValueChange}
        open={selectOpen}
        onOpenChange={setSelectOpen}
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
                    <button
                      className="absolute right-2 cursor-pointer top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-red-500 hover:text-red-600 rounded-sm transition-colors z-20 opacity-0 group-hover:opacity-100 pointer-events-auto"
                      style={{ color: '#ef4444' }}
                      onClick={(e) => {
                        console.log('🖱️ Trash button clicked!');
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenDeleteDialog(chat.id);
                      }}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
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

      {/* AlertDialog controlado separadamente */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={handleDeleteChat}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}