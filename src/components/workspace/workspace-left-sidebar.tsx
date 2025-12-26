"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  FileText,
  Trash2,
  LogOut,
  Upload,
  Loader2,
  Shield,
  ChevronDown,
} from "lucide-react"
import { useChats, useDeleteChat } from "@/hooks/api/use-chat"
import { useDocuments, useDeleteDocument, useUploadDocument } from "@/hooks/api/use-documents"
import { useUser } from "@/store/app-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { tokenStore } from "@/lib/auth/stores/auth.store"
import { Can } from "@/components/permissions/can"

export interface WorkspaceLeftSidebarProps {
  workspaceId: string
  workspaceName?: string
  organizationId: string
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onDocumentClick?: (documentId: string, documentName: string) => void
  className?: string
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
}: WorkspaceLeftSidebarProps) {
  const router = useRouter()
  const user = useUser()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Queries
  const { data: chatsData } = useChats(workspaceId)
  const { data: documents = [] } = useDocuments(workspaceId)

  // Mutations
  const { mutateAsync: deleteChat } = useDeleteChat(workspaceId)
  const { mutateAsync: deleteDocument } = useDeleteDocument(workspaceId)
  const uploadDocumentMutation = useUploadDocument(workspaceId)

  const chats = chatsData?.chats || []

  const handleBackToOrganizations = React.useCallback(() => {
    router.push('/org')
  }, [router])

  const handleLogout = React.useCallback(() => {
    tokenStore.clear()
    router.push("/login")
  }, [router])

  const handleDeleteChat = React.useCallback(
    async (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!confirm("Tem certeza que deseja excluir este chat?")) return

      try {
        await deleteChat(chatId)
        if (currentChatId === chatId) {
          onNewChat()
        }
        toast.success("Chat excluído com sucesso")
      } catch (error) {
        toast.error("Erro ao excluir chat")
      }
    },
    [deleteChat, currentChatId, onNewChat]
  )

  const handleDeleteDocument = React.useCallback(
    async (documentId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!confirm("Tem certeza que deseja excluir este documento?")) return

      try {
        await deleteDocument(documentId)
        toast.success("Documento excluído com sucesso")
      } catch (error) {
        toast.error("Erro ao excluir documento")
      }
    },
    [deleteDocument]
  )

  const handleFileUpload = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são suportados")
        return
      }

      try {
        await uploadDocumentMutation.mutateAsync({
          file,
          name: file.name,
        })
        // Success toast is handled by the mutation hook
      } catch (error) {
        // Error toast is handled by the mutation hook
        // Extract error info for better logging
        const errorMessage = error instanceof Error 
          ? error.message 
          : (error && typeof error === 'object' && 'message' in error)
          ? String(error.message)
          : 'Erro desconhecido ao enviar documento'
        
        console.error("Error uploading document:", {
          message: errorMessage,
          error: error instanceof Error ? error : String(error),
          ...(error && typeof error === 'object' && 'statusCode' in error ? { statusCode: error.statusCode } : {}),
          ...(error && typeof error === 'object' && 'code' in error ? { code: error.code } : {}),
        })
      } finally {
        event.target.value = ""
      }
    },
    [uploadDocumentMutation]
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 w-[280px] flex-shrink-0",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleBackToOrganizations}
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Voltar para Organizações</span>
        </Button>

        <div>
          <h2 className="text-sm font-semibold truncate text-gray-900">{workspaceName}</h2>
          <p className="text-xs text-gray-500">Projeto</p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Chat Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Conversas
              </h3>
            </div>

            <Button
              onClick={onNewChat}
              className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white"
              size="sm"
            >
              <Plus className="size-4" />
              <span>Novo Chat</span>
            </Button>

            {chats.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">Nenhum chat ainda</p>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      currentChatId === chat.id
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    )}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <MessageSquare className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.title || "Chat sem título"}
                      </p>
                      {chat.updatedAt && (
                        <p className="text-xs text-gray-500 truncate">
                          {formatDistanceToNow(new Date(chat.updatedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Documentos
              </h3>
            </div>

            {/* Upload Button - Sempre visível mas pode estar desabilitado */}
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
              variant="outline"
              size="sm"
              className="w-full gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              disabled={uploadDocumentMutation.isPending}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              {uploadDocumentMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              <span className="text-sm">Enviar Documento</span>
            </Button>

            {documents.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">Nenhum documento</p>
            ) : (
              <div className="space-y-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onDocumentClick?.(doc.id, doc.name)}
                  >
                    <FileText className="size-4 shrink-0 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      {doc.createdAt && (
                        <p className="text-xs text-gray-500 truncate">
                          {formatDistanceToNow(new Date(doc.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    <Can
                      anyPermission={["document.delete.all", "document.delete.own"]}
                      workspaceId={workspaceId}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                      </Button>
                    </Can>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Settings Section (RBAC Protected) */}
          <Can
            anyPermission={["workspace.admin", "member.read.all", "role.read.all"]}
            workspaceId={workspaceId}
          >
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Configurações
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() =>
                  router.push(`/org/${organizationId}/workspace/${workspaceId}/settings/access`)
                }
              >
                <Shield className="size-4" />
                <span className="text-sm">Controle de Acesso</span>
              </Button>
            </div>
          </Can>
        </div>
      </ScrollArea>

      {/* Footer - User Menu */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-3 h-auto p-2 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <ChevronDown className="size-4 text-gray-500 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 bg-white border border-gray-200 shadow-lg"
            sideOffset={5}
          >
            <DropdownMenuLabel className="bg-white">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || "Usuário"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
