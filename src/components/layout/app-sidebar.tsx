"use client"

import * as React from "react"
import { ChatCircle, Folder, House, Bell, User as UserIcon, Plus as PlusIcon, Robot, FileText, Book as BookIcon, Layout } from "@phosphor-icons/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"
import { useWorkspaceStore } from "@/store/workspace-store"
import { SidebarItem } from "./sidebar-item"
import { FloatingSidebar } from "./floating-sidebar"
import { ChatHistoryList } from "@/components/features/chat/chat-history-list"
import { DocumentsSidebar } from "@/components/layout/sidebars/documents-sidebar"
import { HomeSidebar } from "@/components/layout/sidebars/home-sidebar"
import { SpacesSidebar } from "@/components/layout/sidebars/spaces-sidebar"
import { AgentsSidebar } from "@/components/layout/sidebars/agents-sidebar"
import { PagesSidebar } from "@/components/layout/sidebars/pages-sidebar"
import { TemplatesSidebar } from "@/components/layout/sidebars/templates-sidebar"

import { AccountSettingsMenu } from "./account-settings-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const { addTabInSplit, addTab, addTabInNewWindow, tabs, setActiveTab, setSettingsOpen } = useWorkspaceStore()
  
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (item: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredItem(item)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null)
    }, 300) // Small delay to allow moving to the floating sidebar
  }

  const handleFloatingMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleFloatingMouseLeave = () => {
    setHoveredItem(null)
  }

  const navigateTo = (url: string, type?: 'home' | 'chat' | 'files' | 'spaces' | 'agents' | 'pages' | 'templates') => {
    // If we are in the workspace layout (which we assume we are if using this sidebar in /home),
    // we should switch tabs instead of routing, unless it's a route we don't handle in tabs (like settings)
    
    if (type) {
      // Check if a tab of this type already exists
      const existingTab = tabs.find(t => t.type === type)
      
      if (existingTab) {
        setActiveTab(existingTab.id)
      } else {
        // Create new tab (não substitui a atual)
        const title = type.charAt(0).toUpperCase() + type.slice(1)
        // For chat, we might want to start a new chat or go to history
        const data = type === 'chat' ? { chatId: 'new', isEmpty: true } : undefined
        addTabInNewWindow(type, title, data)
      }
    } else {
      router.push(url)
    }
    setHoveredItem(null)
  }

  const handleNewChat = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Shift+Click: adicionar em split
      addTabInSplit('chat', 'New Chat', { chatId: 'new', isEmpty: true })
    } else {
      // Click normal: criar nova aba (não substitui a atual)
      addTabInNewWindow('chat', 'New Chat', { chatId: 'new', isEmpty: true })
    }
    
    setHoveredItem(null)
  }

  const chatUrl = currentOrganization && currentWorkspace 
    ? `/${currentOrganization.id}/workspace/${currentWorkspace.id}` 
    : '/chat'

  const documentsUrl = '/documentos'
  const homeUrl = '/home'

  return (
    <>
      <Sidebar collapsible="none" className="border-r relative z-50" style={{ width: "var(--sidebar-width-icon)" }} {...props}>
        <SidebarContent className="flex flex-col gap-1 p-0 pt-4">
          <div className="flex justify-center pb-4 pt-2">
            <img src="/iso_Aw.png" alt="Logo" className="h-8 w-8 dark:hidden" />
            <img src="/iso_Ad.png" alt="Logo" className="h-8 w-8 hidden dark:block" />
          </div>
          <div className="flex justify-center pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full bg-sidebar-accent/50 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleNewChat}
                >
                  <PlusIcon weight="bold" className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                sideOffset={10} 
                className="bg-[#0f0f0f] text-white border-none font-semibold shadow-xl [&>svg]:hidden px-3 py-1.5 rounded-md text-xs"
              >
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <SidebarItem
            icon={House}
            label="Home"
            isActive={pathname === homeUrl}
            isHovered={hoveredItem === 'home'}
            onClick={() => navigateTo(homeUrl, 'home')}
            onMouseEnter={() => handleMouseEnter('home')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={ChatCircle}
            label="Chats"
            isActive={pathname.startsWith(chatUrl)}
            isHovered={hoveredItem === 'chat'}
            onClick={() => navigateTo(chatUrl, 'chat')}
            onMouseEnter={() => handleMouseEnter('chat')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={Folder}
            label="Spaces"
            isActive={false}
            isHovered={hoveredItem === 'spaces'}
            onClick={() => navigateTo('/spaces', 'spaces')}
            onMouseEnter={() => handleMouseEnter('spaces')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={Robot}
            label="Agents"
            isActive={false}
            isHovered={hoveredItem === 'agents'}
            onClick={() => navigateTo('/agents', 'agents')}
            onMouseEnter={() => handleMouseEnter('agents')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={FileText}
            label="Files"
            isActive={pathname.startsWith(documentsUrl)}
            isHovered={hoveredItem === 'documents'}
            onClick={() => navigateTo(documentsUrl, 'files')}
            onMouseEnter={() => handleMouseEnter('documents')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={BookIcon}
            label="Pages"
            isActive={false}
            isHovered={hoveredItem === 'pages'}
            onClick={() => navigateTo('/pages', 'pages')}
            onMouseEnter={() => handleMouseEnter('pages')}
            onMouseLeave={handleMouseLeave}
          />
          <SidebarItem
            icon={Layout}
            label="Templates"
            isActive={false}
            isHovered={hoveredItem === 'templates'}
            onClick={() => navigateTo('/templates', 'templates')}
            onMouseEnter={() => handleMouseEnter('templates')}
            onMouseLeave={handleMouseLeave}
          />
        </SidebarContent>

        <SidebarFooter className="p-0 flex flex-col gap-0 pb-2">
          <SidebarItem
            icon={Bell}
            label="Notificações"
            isActive={false}
            isHovered={hoveredItem === 'notifications'}
            onClick={() => {}}
            onMouseEnter={() => handleMouseEnter('notifications')}
            onMouseLeave={handleMouseLeave}
            showLabel={false}
          />
          <AccountSettingsMenu>
            <SidebarItem
              icon={UserIcon}
              label="Account"
              isHovered={hoveredItem === 'account'}
              onMouseEnter={() => handleMouseEnter('account')}
              onMouseLeave={handleMouseLeave}
            />
          </AccountSettingsMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Floating Sidebars */}
      <FloatingSidebar
        isOpen={hoveredItem === 'chat'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <ChatHistoryList 
          onSelectChat={(chatId) => {
            // Criar nova aba de chat (não substitui a atual)
            const title = chatId === 'new' ? 'New Chat' : `Chat ${chatId}`
            addTabInNewWindow('chat', title, { chatId, isEmpty: chatId === 'new' })
            setHoveredItem(null) // Fechar sidebar flutuante
          }}
        />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'documents'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <DocumentsSidebar 
          onDocumentSelect={(id) => {
             console.log("Selected document", id)
          }}
        />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'home'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <HomeSidebar />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'spaces'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <SpacesSidebar />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'agents'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <AgentsSidebar />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'pages'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <PagesSidebar />
      </FloatingSidebar>

      <FloatingSidebar
        isOpen={hoveredItem === 'templates'}
        onMouseEnter={handleFloatingMouseEnter}
        onMouseLeave={handleFloatingMouseLeave}
      >
        <TemplatesSidebar />
      </FloatingSidebar>
    </>
  )
}
