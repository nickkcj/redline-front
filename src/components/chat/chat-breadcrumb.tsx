"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { ChatSelect } from "./chat-select";
import { useRenameChat, useDeleteChat } from "@/hooks/api/use-chat";
import { useCurrentWorkspace } from "@/store/app-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ChatBreadcrumbProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string | null) => void;
  currentChatId?: string;
  currentChatTitle?: string;
}

export function ChatBreadcrumb({
  onNewChat,
  onSelectChat,
  currentChatId,
  currentChatTitle
}: ChatBreadcrumbProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const currentWorkspace = useCurrentWorkspace();
  const router = useRouter();

  const renameChat = useRenameChat(currentWorkspace?.id || "");
  const deleteChat = useDeleteChat(currentWorkspace?.id || "");

  React.useEffect(() => {
    if (currentChatTitle) {
      setEditedTitle(currentChatTitle);
    }
  }, [currentChatTitle]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = async () => {
    if (!currentChatId || !editedTitle.trim()) {
      setEditedTitle(currentChatTitle || "");
      setIsEditing(false);
      return;
    }

    if (editedTitle === currentChatTitle) {
      setIsEditing(false);
      return;
    }

    try {
      await renameChat.mutateAsync({ chatId: currentChatId, title: editedTitle.trim() });
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao renomear o chat");
      setEditedTitle(currentChatTitle || "");
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!currentChatId) return;

    try {
      await deleteChat.mutateAsync(currentChatId);
      setShowDeleteDialog(false);
      router.push("/ai-chat");
      if (onNewChat) onNewChat();
    } catch (error) {
      toast.error("Erro ao excluir o chat");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditedTitle(currentChatTitle || "");
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
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
              {currentChatTitle && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="flex items-center gap-2">
                    {isEditing ? (
                      <Input
                        ref={inputRef}
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="h-7 px-2 py-1 text-sm"
                        placeholder="Nome do chat"
                      />
                    ) : (
                      <BreadcrumbPage className="max-w-[200px] truncate">
                        {currentChatTitle}
                      </BreadcrumbPage>
                    )}
                    {currentChatId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <ChatSelect
            onSelectChat={onSelectChat}
            currentChatId={currentChatId}
            placeholder="Histórico"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir chat</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este chat? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}