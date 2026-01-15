'use client'

import * as React from 'react'
import { 
  Home, 
  MessageSquarePlus, 
  FileText, 
  ChevronRight, 
  Search, 
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { SidebarItemMenu } from './sidebar-item-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { WorkspaceSwitcher } from './workspace-switcher'
import { useWorkspaceStore } from '@/store/workspace-store'
import { useSearch } from '@/contexts/search-context'

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function SidebarSection({ title, children, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-0.5">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 h-7"
        >
          <span>{title}</span>
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface SidebarItemProps {
  icon?: React.ElementType
  title: string
  active?: boolean
  type?: 'chat' | 'document'
  itemId?: string
  onClick?: () => void
  onShiftClick?: () => void
  onAltClick?: () => void
}

function SidebarItem({ 
  icon: Icon, 
  title, 
  active = false,
  type = 'document',
  itemId,
  onClick,
  onShiftClick,
  onAltClick
}: SidebarItemProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.shiftKey && onShiftClick) {
      onShiftClick()
      return
    }
    
    if (e.altKey && onAltClick) {
      onAltClick()
      return
    }
    
    // Normal click
    if (onClick) {
      onClick()
    }
  }

  return (
    <>
      <div className="group relative flex items-center w-full overflow-hidden">
        <Button
          variant="ghost"
          onClick={handleClick}
          className={cn(
            "w-full justify-start gap-2 pl-4 pr-1 h-8 font-normal text-left my-0 relative",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0",
            "focus:outline-none focus-visible:outline-none outline-none",
            "before:hidden after:hidden ring-0 ring-offset-0",
            active && "bg-accent text-accent-foreground pl-[18px]"
          )}
        >
          {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
          <span className="truncate flex-1 text-left min-w-0">{title}</span>
          <SidebarItemMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            title={title}
            type={type}
            itemId={itemId}
            onOpen={onClick}
            onOpenInNewTab={onShiftClick}
            onOpenInNewWindow={onShiftClick}
            onOpenInSidePeek={onAltClick}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1",
                  active && "opacity-100"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            }
          />
        </Button>
      </div>
    </>
  )
}

export function SidebarLeft({ width }: { width?: number }) {
  const { 
    addTab, 
    addTabInNewWindow,
    addTabWithSplitChoice,
    sidebarLeftOpen, 
    setSettingsOpen,
    tabs,
    activeTabId
  } = useWorkspaceStore()
  const { openSearch } = useSearch()

  // Get the active tab to determine which sidebar item should be active
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  if (!sidebarLeftOpen) return null

  return (
    <div 
      className="flex h-full flex-col border-r bg-muted/10 shrink-0"
      style={{ width: width ? `${width}px` : '16rem' }}
    >
      {/* Workspace Switcher */}
      <div className="p-2">
        <WorkspaceSwitcher />
      </div>

      {/* Main Navigation */}
      <div className="px-2 py-2 space-y-0.5">
        <SidebarItem 
          icon={Search} 
          title="Search" 
          onClick={openSearch} 
        />
        <SidebarItem 
          icon={Home} 
          title="Home"
          active={activeTab?.type === 'home'}
          onClick={() => addTab('home', 'Home')} 
        />
        <SidebarItem 
          icon={MessageSquarePlus} 
          title="New Chat"
          active={activeTab?.type === 'chat' && !activeTab?.data?.id}
          onClick={() => addTab('chat', 'New Chat')} 
        />
        <SidebarItem 
          icon={FileText} 
          title="Documents"
          active={activeTab?.type === 'document' && !activeTab?.data?.id}
          onClick={() => addTab('document', 'Documents')} 
        />
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {/* Chat History */}
          <SidebarSection title="Recent Chats">
            <SidebarItem 
              title="Análise de requisitos" 
              icon={MessageSquarePlus}
              type="chat"
              itemId="chat-1"
              active={activeTab?.type === 'chat' && activeTab?.data?.id === 'chat-1'}
              onClick={() => addTab('chat', 'Análise de requisitos', { id: 'chat-1' })}
              onShiftClick={() => addTabInNewWindow('chat', 'Análise de requisitos', { id: 'chat-1' })}
              onAltClick={() => addTabWithSplitChoice('chat', 'Análise de requisitos', { id: 'chat-1' })}
            />
            <SidebarItem 
              title="Discussão arquitetura" 
              icon={MessageSquarePlus}
              type="chat"
              itemId="chat-2"
              active={activeTab?.type === 'chat' && activeTab?.data?.id === 'chat-2'}
              onClick={() => addTab('chat', 'Discussão arquitetura', { id: 'chat-2' })}
              onShiftClick={() => addTabInNewWindow('chat', 'Discussão arquitetura', { id: 'chat-2' })}
              onAltClick={() => addTabWithSplitChoice('chat', 'Discussão arquitetura', { id: 'chat-2' })}
            />
            <SidebarItem 
              title="Review de código" 
              icon={MessageSquarePlus}
              type="chat"
              itemId="chat-3"
              active={activeTab?.type === 'chat' && activeTab?.data?.id === 'chat-3'}
              onClick={() => addTab('chat', 'Review de código', { id: 'chat-3' })}
              onShiftClick={() => addTabInNewWindow('chat', 'Review de código', { id: 'chat-3' })}
              onAltClick={() => addTabWithSplitChoice('chat', 'Review de código', { id: 'chat-3' })}
            />
            <SidebarItem 
              title="Planejamento Sprint" 
              icon={MessageSquarePlus}
              type="chat"
              itemId="chat-4"
              active={activeTab?.type === 'chat' && activeTab?.data?.id === 'chat-4'}
              onClick={() => addTab('chat', 'Planejamento Sprint', { id: 'chat-4' })}
              onShiftClick={() => addTabInNewWindow('chat', 'Planejamento Sprint', { id: 'chat-4' })}
              onAltClick={() => addTabWithSplitChoice('chat', 'Planejamento Sprint', { id: 'chat-4' })}
            />
            <SidebarItem 
              title="Ideias de features" 
              icon={MessageSquarePlus}
              type="chat"
              itemId="chat-5"
              active={activeTab?.type === 'chat' && activeTab?.data?.id === 'chat-5'}
              onClick={() => addTab('chat', 'Ideias de features', { id: 'chat-5' })}
              onShiftClick={() => addTabInNewWindow('chat', 'Ideias de features', { id: 'chat-5' })}
              onAltClick={() => addTabWithSplitChoice('chat', 'Ideias de features', { id: 'chat-5' })}
            />
          </SidebarSection>

          {/* Document History */}
          <SidebarSection title="Recent Documents">
            <SidebarItem 
              title="Especificações Técnicas" 
              icon={FileText}
              type="document"
              itemId="doc-1"
              active={activeTab?.type === 'document' && activeTab?.data?.id === 'doc-1'}
              onClick={() => addTab('document', 'Especificações Técnicas', { id: 'doc-1' })}
              onShiftClick={() => addTabInNewWindow('document', 'Especificações Técnicas', { id: 'doc-1' })}
              onAltClick={() => addTabWithSplitChoice('document', 'Especificações Técnicas', { id: 'doc-1' })}
            />
            <SidebarItem 
              title="Guia de Onboarding" 
              icon={FileText}
              type="document"
              itemId="doc-2"
              active={activeTab?.type === 'document' && activeTab?.data?.id === 'doc-2'}
              onClick={() => addTab('document', 'Guia de Onboarding', { id: 'doc-2' })}
              onShiftClick={() => addTabInNewWindow('document', 'Guia de Onboarding', { id: 'doc-2' })}
              onAltClick={() => addTabWithSplitChoice('document', 'Guia de Onboarding', { id: 'doc-2' })}
            />
            <SidebarItem 
              title="Roadmap 2024" 
              icon={FileText}
              type="document"
              itemId="doc-3"
              active={activeTab?.type === 'document' && activeTab?.data?.id === 'doc-3'}
              onClick={() => addTab('document', 'Roadmap 2024', { id: 'doc-3' })}
              onShiftClick={() => addTabInNewWindow('document', 'Roadmap 2024', { id: 'doc-3' })}
              onAltClick={() => addTabWithSplitChoice('document', 'Roadmap 2024', { id: 'doc-3' })}
            />
            <SidebarItem 
              title="Meeting Notes" 
              icon={FileText}
              type="document"
              itemId="doc-4"
              active={activeTab?.type === 'document' && activeTab?.data?.id === 'doc-4'}
              onClick={() => addTab('document', 'Meeting Notes', { id: 'doc-4' })}
              onShiftClick={() => addTabInNewWindow('document', 'Meeting Notes', { id: 'doc-4' })}
              onAltClick={() => addTabWithSplitChoice('document', 'Meeting Notes', { id: 'doc-4' })}
            />
          </SidebarSection>

          {/* Private Section */}
          <SidebarSection title="Private">
             <SidebarItem 
               title="Personal Notes" 
               icon={FileText}
               type="document"
               onClick={() => addTab('document', 'Personal Notes')}
               onShiftClick={() => addTabInNewWindow('document', 'Personal Notes')}
               onAltClick={() => addTabWithSplitChoice('document', 'Personal Notes')}
             />
             <SidebarItem 
               title="Drafts" 
               icon={FileText}
               type="document"
               onClick={() => addTab('document', 'Drafts')}
               onShiftClick={() => addTabInNewWindow('document', 'Drafts')}
               onAltClick={() => addTabWithSplitChoice('document', 'Drafts')}
             />
          </SidebarSection>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t mt-auto">
        <SidebarItem icon={Settings} title="Settings" onClick={() => setSettingsOpen(true)} />
      </div>
    </div>
  )
}
