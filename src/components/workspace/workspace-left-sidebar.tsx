"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  User as UserIcon,
  LogOut,
  Settings,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useChats, useDeleteChat, useRenameChat } from "@/hooks/api/use-chat";
import { useDocuments, useDeleteDocument, useUploadDocument } from "@/hooks/api/use-documents";
import { useUser, useCurrentOrganization, useCurrentWorkspace } from "@/store/app-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { tokenStore } from "@/lib/auth/stores/auth.store";
import { UserInfoModal } from "./user-info-modal";

export interface WorkspaceLeftSidebarProps {
  workspaceId: string;
  workspaceName?: string;
  organizationId: string;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDocumentClick?: (documentId: string, documentName: string) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WorkspaceLeftSidebar({
  workspaceId,
  workspaceName = "Workspace",
  organizationId,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDocumentClick,
  className,
  collapsed = false,
  onToggleCollapse,
}: WorkspaceLeftSidebarProps) {
  const router = useRouter();
  const user = useUser();
  const currentOrganization = useCurrentOrganization();
  const currentWorkspace = useCurrentWorkspace();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userInfoModalOpen, setUserInfoModalOpen] = React.useState(false);

  // Queries
  const { data: chatsData } = useChats(workspaceId);
  const { data: documents = [] } = useDocuments(workspaceId);

  // Mutations
  const { mutateAsync: deleteChat } = useDeleteChat(workspaceId);
  const { mutateAsync: renameChat } = useRenameChat(workspaceId);
  const { mutateAsync: deleteDocument } = useDeleteDocument(workspaceId);
  const uploadDocumentMutation = useUploadDocument(workspaceId);

  const chats = chatsData?.chats || [];

  const handleBackToWorkspaces = React.useCallback(() => {
    router.push(`/org/${organizationId}`);
  }, [router, organizationId]);

  const handleLogout = React.useCallback(() => {
    tokenStore.clear();
    router.push("/login");
  }, [router]);

  const handleDeleteChat = React.useCallback(
    async (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Tem certeza que deseja excluir este chat?")) return;

      try {
        await deleteChat(chatId);
        if (currentChatId === chatId) {
          onChatSelect("");
        }
      } catch (error) {
        toast.error("Erro ao excluir chat");
      }
    },
    [deleteChat, currentChatId, onChatSelect]
  );

  const handleDeleteDocument = React.useCallback(
    async (documentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Tem certeza que deseja excluir este documento?")) return;

      try {
        await deleteDocument(documentId);
      } catch (error) {
        toast.error("Erro ao excluir documento");
      }
    },
    [deleteDocument]
  );

  const handleFileUpload = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validar tipo de arquivo (apenas PDF conforme a API)
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são permitidos");
        return;
      }

      // Validar tamanho (exemplo: 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }

      try {
        await uploadDocumentMutation.mutateAsync({
          file,
          name: file.name,
        });

        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao fazer upload do documento");
      }
    },
    [uploadDocumentMutation]
  );

  const getUserInitials = React.useCallback(() => {
    if (!user) return "U";
    const name = user.name || user.email || "User";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [user]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (collapsed) {
    return (
      <div className="flex flex-col h-screen bg-white border-r w-12 flex-shrink-0 items-center py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleCollapse}
          title="Expandir sidebar"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 w-[280px] flex-shrink-0 relative",
        className
      )}
    >
      {/* Collapse Button */}
      {onToggleCollapse && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-4 h-6 w-6 p-0 z-10 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
          onClick={onToggleCollapse}
          title="Colapsar sidebar"
        >
          <ChevronLeft className="size-3" />
        </Button>
      )}

      {/* Header */}
      <div className="p-4 space-y-3 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
          onClick={handleBackToWorkspaces}
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Voltar para Projetos</span>
        </Button>

        <div>
          <h2 className="text-sm font-semibold truncate text-gray-900">{workspaceName}</h2>
          <p className="text-xs text-gray-600">Projeto</p>
        </div>

        <Button onClick={onNewChat} className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white" size="sm">
          <Plus className="size-4" />
          <span>Novo Chat</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6 pb-6">
          {/* Chats Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2">
              Conversas
            </h3>
            {chats.length === 0 ? (
              <p className="text-xs text-gray-500 px-2 py-4">
                Nenhum chat ainda
              </p>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      currentChatId === chat.id
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50 text-gray-900"
                    )}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <MessageSquare className="size-4 shrink-0 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 48px)' }}>
                      <p className="text-sm font-medium leading-tight" style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                      }}>
                        {chat.title || "Chat sem título"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5" style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                      }}>
                        {chat.updatedAt &&
                          formatDistanceToNow(new Date(chat.updatedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt(
                              "Novo título:",
                              chat.title || ""
                            );
                            if (newTitle) {
                              renameChat({
                                chatId: chat.id,
                                title: newTitle,
                              });
                            }
                          }}
                        >
                          <Edit className="mr-2 size-4" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Documents Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Documentos
              </h3>
              <input
                id="file-upload-sidebar"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadDocumentMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-100 flex items-center justify-center"
                disabled={uploadDocumentMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Enviar documento PDF"
              >
                {uploadDocumentMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin text-gray-600" />
                ) : (
                  <Upload className="size-4 text-gray-600" />
                )}
              </Button>
            </div>
            {documents.length === 0 ? (
              <p className="text-xs text-gray-500 px-2 py-4">
                Nenhum documento
              </p>
            ) : (
              <div className="space-y-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onDocumentClick?.(doc.id, doc.name)}
                  >
                    <FileText className="size-4 shrink-0 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 48px)' }}>
                      <p className="text-sm font-medium text-gray-900 leading-tight" style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                      }}>
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5" style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                      }}>
                        {formatFileSize(doc.sizeBytes)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </ScrollArea>
      </div>

      {/* Footer - User Area */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3 px-3"
          onClick={() => setUserInfoModalOpen(true)}
        >
          <Avatar className="size-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate text-gray-900">
              {user?.name || user?.email || "Usuário"}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            )}
          </div>
        </Button>

        <UserInfoModal
          open={userInfoModalOpen}
          onOpenChange={setUserInfoModalOpen}
          user={user}
          organizationName={currentOrganization?.name}
          workspaceName={currentWorkspace?.name || workspaceName}
        />
      </div>
    </div>
  );
}
