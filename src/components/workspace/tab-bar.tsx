'use client'

import * as React from 'react'
import { X, FileText, Home, MessageSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore, Tab } from '@/store/workspace-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TabBar() {
  const { tabs, activeTabId, activeSplitTabId, activeThirdTabId, setActiveTab, closeTab, isSplit, isThreeColumnSplit, addTab } = useWorkspaceStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return Home
      case 'chat': return MessageSquare
      case 'document': return FileText
      default: return FileText
    }
  }

  // Agrupar abas por groupId
  const groupedTabs: { [key: string]: Tab[] } = {}
  const ungroupedTabs: Tab[] = []
  
  tabs.forEach(tab => {
    if (tab.groupId) {
      if (!groupedTabs[tab.groupId]) {
        groupedTabs[tab.groupId] = []
      }
      groupedTabs[tab.groupId].push(tab)
    } else {
      ungroupedTabs.push(tab)
    }
  })

  // Criar lista de elementos (grupos ou abas individuais)
  const elements: Array<{ type: 'group', groupId: string, tabs: Tab[] } | { type: 'tab', tab: Tab }> = []
  
  // Adicionar grupos
  Object.entries(groupedTabs).forEach(([groupId, groupTabs]) => {
    elements.push({ type: 'group', groupId, tabs: groupTabs })
  })
  
  // Adicionar abas não agrupadas
  ungroupedTabs.forEach(tab => {
    elements.push({ type: 'tab', tab })
  })

  const renderTab = (tab: Tab, isInGroup: boolean = false) => {
    const Icon = getIcon(tab.type)
    const isActive = tab.id === activeTabId || (isSplit && tab.id === activeSplitTabId) || (isThreeColumnSplit && tab.id === activeThirdTabId)

    return (
      <div
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          "group relative flex h-8 min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 px-3 text-xs font-medium transition-colors select-none",
          !isInGroup && "border border-b-0 rounded-t-md ml-1",
          isActive 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-muted/50",
          !isInGroup && (isActive ? "border-border" : "border-transparent")
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <div className="truncate flex-1 relative overflow-hidden">
          <span className="relative z-10">{tab.title}</span>
          {/* Fade effect para textos longos */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
            style={{
              background: isActive 
                ? 'linear-gradient(to left, hsl(var(--background)), transparent)'
                : 'linear-gradient(to left, hsl(var(--background) / 0.95), transparent)'
            }}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            closeTab(tab.id)
          }}
          className="rounded-sm p-0.5 hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="h-3 w-3" />
        </button>
        
        {/* Active Indicator Line */}
        {isActive && !isInGroup && (
          <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-background" />
        )}
      </div>
    )
  }

  const renderGroup = (groupId: string, groupTabs: Tab[]) => {
    return (
      <div
        key={groupId}
        className="relative flex h-8 rounded-t-md overflow-hidden gap-0 ml-1"
      >
        {groupTabs.map((tab, idx) => {
          const Icon = getIcon(tab.type)
          const isActive = tab.id === activeTabId || (isSplit && tab.id === activeSplitTabId) || (isThreeColumnSplit && tab.id === activeThirdTabId)
          const isFirst = idx === 0
          const isLast = idx === groupTabs.length - 1

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group relative flex h-full min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 px-3 text-xs font-medium transition-colors select-none",
                isFirst && "rounded-tl-md",
                isLast && "rounded-tr-md"
              )}
              style={{
                backgroundColor: isActive 
                  ? 'hsl(0, 0%, 30%)' 
                  : 'hsl(0, 0%, 25%)',
                color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'
              }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <div className="truncate flex-1 relative overflow-hidden">
                <span className="relative z-10">{tab.title}</span>
                {/* Fade effect com gradiente */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
                  style={{
                    background: isActive 
                      ? 'linear-gradient(to left, hsl(0, 0%, 30%), transparent)'
                      : 'linear-gradient(to left, hsl(0, 0%, 25%), transparent)'
                  }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="rounded-sm p-0.5 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-full items-end gap-0 overflow-x-auto no-scrollbar min-w-0 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {elements.map((element) => {
        if (element.type === 'group') {
          return renderGroup(element.groupId, element.tabs)
        } else {
          return renderTab(element.tab, false)
        }
      })}

      {/* New Tab Button inline */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
            <div className="flex h-8 items-center justify-center px-2 cursor-pointer text-muted-foreground hover:bg-muted/50 rounded-t-md hover:text-foreground transition-colors ml-1">
                <Plus className="h-4 w-4" />
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create New</DialogTitle>
            <DialogDescription>
                Start a new chat, document, or project.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                addTab('chat', 'New Chat', { isEmpty: true })
                setDialogOpen(false)
              }}
            >
              New Chat
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                addTab('document', 'New Document', { isEmpty: true })
                setDialogOpen(false)
              }}
            >
              New Document
            </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
