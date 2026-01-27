'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  House as Home,
  Folder,
  Users,
  Gear as Settings,
  FileText,
  Plus,
  CaretRight as ChevronRight,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ThreeColumnLayoutProps {
  children: React.ReactNode
}

// Menu items para a sidebar esquerda
const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    url: '/dashboard',
  },
  {
    title: 'Projetos',
    icon: Folder,
    url: '/projetos',
  },
  {
    title: 'Files',
    icon: FileText,
    url: '/documentos',
  },
  {
    title: 'Equipe',
    icon: Users,
    url: '/equipe',
  },
  {
    title: 'Configurações',
    icon: Settings,
    url: '/configuracoes',
  },
]

// Documentos exemplo para a sidebar direita
const documentosRecentes = [
  { id: 1, nome: 'Proposta Projeto A', tipo: 'PDF' },
  { id: 2, nome: 'Contrato Cliente B', tipo: 'DOCX' },
  { id: 3, nome: 'Relatório Mensal', tipo: 'PDF' },
  { id: 4, nome: 'Especificações Técnicas', tipo: 'PDF' },
]

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const pathname = usePathname()
  const [selectedDoc, setSelectedDoc] = React.useState<number | null>(null)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar Esquerda - Navegação Principal */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Scaffold</span>
                <span className="text-xs text-muted-foreground">DOOOR</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                      >
                        <a href={item.url}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="text-left">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <Button className="w-full justify-start gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Novo Projeto
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  UN
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">Usuário</span>
                <span className="text-xs text-muted-foreground truncate">
                  user@example.com
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Conteúdo Central - Modular */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>

        {/* Sidebar Direita - Visualização de Documentos */}
        <aside className="w-80 border-l bg-muted/20">
          <div className="flex h-full flex-col">
            {/* Header da sidebar direita */}
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Files</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Visualize e gerencie seus documentos
              </p>
            </div>

            {/* Lista de documentos */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    RECENTES
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {documentosRecentes.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                      selectedDoc === doc.id ? 'bg-accent' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.nome}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.tipo} • Há 2 dias
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Preview do documento selecionado */}
              {selectedDoc && (
                <div className="p-4">
                  <div className="rounded-lg border bg-background p-4">
                    <h3 className="text-sm font-semibold mb-2">
                      Pré-visualização
                    </h3>
                    <div className="aspect-3/4 rounded border bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-xs">
                          Visualização do documento
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button className="w-full" size="sm">
                        Abrir Documento
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      </div>
    </SidebarProvider>
  )
}
