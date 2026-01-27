'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  House as Home,
  Plus,
  FileText,
  ChatCircle as MessageSquare,
  CaretDown as ChevronDown,
  MagnifyingGlass as Search,
  Clock,
  Folder,
  DotsThree as MoreHorizontal,
  Gear as Settings,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NotionStyleLayoutProps {
  children: React.ReactNode
}

const workspaces = [
  { id: 1, name: "Castro's Space", icon: 'CN', active: true },
  { id: 2, name: 'Dooor Foundation', icon: 'DF', active: false },
  { id: 3, name: "Nathan Castro's Space", icon: 'NC', active: false },
]

const chatHistory = [
  { id: 1, title: 'Análise de requisitos do projeto', time: 'Há 2 horas' },
  { id: 2, title: 'Discussão sobre arquitetura', time: 'Ontem' },
  { id: 3, title: 'Review de código frontend', time: 'Há 2 dias' },
  { id: 4, title: 'Planejamento Sprint 23', time: 'Há 3 dias' },
  { id: 5, title: 'Definição de APIs REST', time: 'Há 1 semana' },
]

const documentHistory = [
  { id: 1, title: 'Especificações Técnicas', icon: '📄' },
  { id: 2, title: 'Guia de Onboarding', icon: '📘' },
  { id: 3, title: 'Roadmap 2024', icon: '🗺️' },
  { id: 4, title: 'Meeting Notes', icon: '📝' },
]

import { SearchCommand } from '@/components/workspace/search-command'
import { SearchProvider, useSearch } from '@/contexts/search-context'

function NotionStyleLayoutContent({ children }: NotionStyleLayoutProps) {
  const pathname = usePathname()
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0])
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SearchCommand open={isSearchOpen} setOpen={(open) => open ? openSearch() : closeSearch()} />
      
      {/* Sidebar Esquerda - Estilo Notion */}
      <aside className="w-60 border-r bg-muted/20 flex flex-col">
        {/* Header com Workspace Selector */}
        <div className="p-3 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 px-2 hover:bg-accent text-left"
              >
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                    {activeWorkspace.icon}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left text-sm font-medium truncate">
                  {activeWorkspace.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-sm">
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setActiveWorkspace(workspace)}
                  className="gap-2 text-sm"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {workspace.icon}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{workspace.name}</span>
                  {workspace.active && (
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <DropdownMenuItem className="gap-2 text-sm">
                <Plus weight="bold" className="h-4 w-4" />
                <span>Novo workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Barra de Pesquisa */}
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <div 
              onClick={openSearch}
              className="flex h-7 w-full items-center rounded-md border border-input bg-background pl-7 pr-3 text-sm text-muted-foreground shadow-sm hover:bg-accent cursor-pointer"
            >
              Search
            </div>
          </div>
        </div>

        {/* Navegação Principal */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 py-2">
            {/* Home */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal text-left"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span className="text-left">Home</span>
            </Button>

            {/* New Chat */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal text-left"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="text-left">New Chat</span>
            </Button>

            {/* Documentos */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal text-left"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-left">Files</span>
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Histórico de Chat */}
          <div className="py-2">
            <div className="flex items-center gap-1 px-2 mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Chats Recentes
              </span>
            </div>

            <div className="space-y-0.5">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full group rounded px-2 py-1.5 hover:bg-accent transition-colors text-left flex items-center gap-2 justify-start"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs truncate text-left">{chat.title}</p>
                    <p className="text-[10px] text-muted-foreground text-left">{chat.time}</p>
                  </div>
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Histórico de Documentos */}
          <div className="py-2">
            <div className="flex items-center gap-1 px-2 mb-1">
              <Folder className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Recent Files
              </span>
            </div>

            <div className="space-y-0.5">
              {documentHistory.map((doc) => (
                <button
                  key={doc.id}
                  className="w-full group rounded px-2 py-1.5 hover:bg-accent transition-colors text-left flex items-center gap-2 justify-start"
                >
                  <span className="text-sm shrink-0">{doc.icon}</span>
                  <span className="text-xs truncate flex-1 text-left">{doc.title}</span>
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer da Sidebar */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal text-left"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="text-left">Settings</span>
          </Button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export function NotionStyleLayout({ children }: NotionStyleLayoutProps) {
  return (
    <SearchProvider>
      <NotionStyleLayoutContent>
        {children}
      </NotionStyleLayoutContent>
    </SearchProvider>
  )
}
