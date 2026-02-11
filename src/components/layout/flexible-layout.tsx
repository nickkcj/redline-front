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
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface FlexibleLayoutProps {
  children: React.ReactNode
  rightSidebar?: React.ReactNode
  showRightSidebar?: boolean
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

export function FlexibleLayout({
  children,
  rightSidebar,
  showRightSidebar = true,
}: FlexibleLayoutProps) {
  const pathname = usePathname()

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
                <span className="text-sm font-semibold">Redline</span>
                <span className="text-xs text-muted-foreground">Platform</span>
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
                <Button className="w-full justify-start gap-2 text-left" size="sm">
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="text-left">Novo Projeto</span>
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

        {/* Sidebar Direita - Conteúdo Customizável */}
        {showRightSidebar && rightSidebar && (
          <aside className="w-80 border-l bg-muted/20">
            {rightSidebar}
          </aside>
        )}
      </div>
    </SidebarProvider>
  )
}
