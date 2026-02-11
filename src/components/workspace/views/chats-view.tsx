'use client'

import * as React from 'react'
import { ChatCircle, MagnifyingGlass, Plus, Funnel, ArrowsDownUp, DotsThree } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useChats, useCreateChat, useDeleteChat } from '@/hooks/api/use-chat'
import { useCurrentWorkspace, useCurrentOrganization } from '@/lib/stores/app.store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ChatsView() {
  const router = useRouter()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const workspaceId = currentWorkspace?.id || ''
  const orgId = currentOrganization?.id || ''
  const baseUrl = `/${orgId}/workspace/${workspaceId}`

  // Fetch chats from API
  const { data: chatsData, isLoading } = useChats(workspaceId)
  const { mutate: createChat, isPending: isCreating } = useCreateChat(workspaceId)
  const { mutate: deleteChat } = useDeleteChat(workspaceId)

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter chats based on search query
  const filteredChats = React.useMemo(() => {
    if (!chatsData?.chats) return []
    if (!searchQuery.trim()) return chatsData.chats

    const query = searchQuery.toLowerCase()
    return chatsData.chats.filter(chat =>
      chat.title?.toLowerCase().includes(query) ||
      chat.id.toLowerCase().includes(query)
    )
  }, [chatsData?.chats, searchQuery])

  // Handle creating a new chat
  const handleCreateChat = () => {
    createChat(
      { title: 'Nova conversa' },
      {
        onSuccess: (newChat) => {
          router.push(`${baseUrl}/chats/${newChat.id}`)
        }
      }
    )
  }

  // Handle deleting a chat
  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm('Tem certeza que deseja deletar este chat?')) {
      deleteChat(chatId)
    }
  }

  // Format chat time
  const formatChatTime = (createdAt: Date) => {
    try {
      return formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return 'agora'
    }
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-8 gap-8 overflow-hidden">
      <div className="flex-none space-y-2">
        <h1 className="text-3xl font-bold">Chats</h1>
        <p className="text-muted-foreground">Gerencie e continue suas conversas.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-4">
        {/* Toolbar */}
        <div className="flex-none flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar chats..."
              className="pl-9 bg-muted/30 border-muted-foreground/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground">
              <Funnel className="h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground">
              <ArrowsDownUp className="h-4 w-4" />
              Ordenar
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2"
              onClick={handleCreateChat}
              disabled={isCreating || !workspaceId}
            >
              <Plus className="h-4 w-4" />
              Novo Chat
            </Button>
          </div>
        </div>

        {/* Chats List */}
        <Card className="flex-1 min-h-0 border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0 h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ChatCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'Nenhum chat encontrado' : 'Nenhum chat ainda'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Tente buscar com outros termos'
                    : 'Comece uma nova conversa para começar'}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    onClick={handleCreateChat}
                    disabled={isCreating || !workspaceId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Chat
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors cursor-pointer group"
                      onClick={() => router.push(`${baseUrl}/chats/${chat.id}`)}
                    >
                      <div className="relative flex items-center justify-center w-10 h-10 bg-background rounded-md border shrink-0">
                        <ChatCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-sm truncate">{chat.title || 'Sem título'}</h4>
                          {chat.documents && chat.documents.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                              {chat.documents.length} {chat.documents.length === 1 ? 'documento' : 'documentos'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                          Criado {formatChatTime(chat.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatChatTime(chat.createdAt)}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DotsThree className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Fixar Chat</DropdownMenuItem>
                            <DropdownMenuItem>Editar Título</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
