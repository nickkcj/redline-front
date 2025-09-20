"use client";

import { History, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChats } from "@/hooks/use-chat";
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
              <SelectItem key={chat.id} value={chat.id}>
                <div className="flex items-center justify-between w-full min-w-0 text-ellipsis">
                  <span className="truncate flex-1 mr-2 text-ellipsis">
                    {chat.title || 'Chat sem título'}
                  </span>
                </div>
              </SelectItem>
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