'use client'

import * as React from 'react'
import { X, FileText, House, ChatCircle, Plus, ShoppingBag, Graph, MapPin, Star, Heart, Robot, ClockCounterClockwise, Sparkle, Folder, Book, MagnifyingGlass, Funnel, User, Buildings, CalendarBlank, ArrowElbowDownLeft, Gear, Lightbulb } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore, Tab } from '@/store/workspace-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TabBar() {
  const { tabs, activeTabId, activeSplitTabId, activeThirdTabId, focusedTabId, setActiveTab, closeTab, isSplit, isThreeColumnSplit, addTab, isCreateNewModalOpen, setCreateNewModalOpen } = useWorkspaceStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return House
      case 'chats': return ChatCircle
      case 'chat': return ChatCircle
      case 'document': return FileText
      case 'files': return FileText
      case 'spaces': return Folder
      case 'agents': return Graph
      case 'pages': return Book
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
    const isFocused = tab.id === focusedTabId
    const showScaffoldIcon = (isSplit || isThreeColumnSplit) && isActive

    return (
      <div
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          "group relative flex h-8 min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 px-3 text-xs font-medium transition-colors select-none",
          !isInGroup && "border border-b-0 rounded-t-md ml-1",
          isActive 
            ? "bg-background shadow-sm" 
            : "text-muted-foreground hover:bg-muted/50",
          (isSplit || isThreeColumnSplit) && isActive && isFocused ? "text-primary" : (isActive ? "text-foreground" : ""),
          !isInGroup && (isActive ? "border-border" : "border-transparent")
        )}
      >
        {showScaffoldIcon ? (
          <div className="relative h-3.5 w-3.5 shrink-0">
             <Image 
               src="/iso_Aw.png" 
               alt="Redline" 
               fill
               className="object-contain dark:hidden"
             />
             <Image 
               src="/iso_Ad.png" 
               alt="Redline" 
               fill
               className="object-contain hidden dark:block"
             />
          </div>
        ) : (
          <Icon className="h-3.5 w-3.5 shrink-0" />
        )}
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
          const isFocused = tab.id === focusedTabId
          // Always show Scaffold icon for tabs in a group
          const showScaffoldIcon = true 
          const isFirst = idx === 0
          const isLast = idx === groupTabs.length - 1

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group relative flex h-full min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 px-3 text-xs font-medium transition-colors select-none",
                isFirst && "rounded-tl-md",
                isLast && "rounded-tr-md",
                isActive 
                  ? "bg-background shadow-sm" 
                  : "bg-muted/20 text-muted-foreground hover:bg-muted/50",
                (isSplit || isThreeColumnSplit) && isActive && isFocused ? "text-primary" : (isActive ? "text-foreground" : "")
              )}
            >
              {showScaffoldIcon ? (
                <div className="relative h-3.5 w-3.5 shrink-0">
                   <Image 
                     src="/iso_Aw.png" 
                     alt="Redline" 
                     fill
                     className="object-contain dark:hidden"
                   />
                   <Image 
                     src="/iso_Ad.png" 
                     alt="Redline" 
                     fill
                     className="object-contain hidden dark:block"
                   />
                </div>
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <div className="truncate flex-1 relative overflow-hidden">
                <span className="relative z-10">{tab.title}</span>
                {/* Fade effect com gradiente */}
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
      <Dialog open={isCreateNewModalOpen} onOpenChange={setCreateNewModalOpen}>
        <DialogTrigger asChild>
            <div className="flex h-8 items-center justify-center px-2 cursor-pointer text-muted-foreground hover:bg-muted/50 rounded-t-md hover:text-foreground transition-colors ml-1">
                <Plus className="h-4 w-4" />
            </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-background border-border" showCloseButton={false}>
            <DialogHeader className="hidden">
            <DialogTitle>Create New</DialogTitle>
            <DialogDescription>
                Start a new chat, file, space, agent or page.
            </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col h-[600px] text-foreground">
              {/* Search Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <MagnifyingGlass className="h-5 w-5 text-muted-foreground" />
                <Input 
                  className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto text-lg placeholder:text-muted-foreground bg-transparent dark:bg-transparent text-foreground" 
                  placeholder="Open in new tab..." 
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Create Actions */}
                <div className="py-2 border-b border-border">
                  <div className="px-2 space-y-0.5">
                    {[
                      { id: 'chat', icon: ChatCircle, label: 'New Chat' },
                      { id: 'agent', icon: Robot, label: 'New Agent' },
                      { id: 'file', icon: FileText, label: 'New File' },
                      { id: 'space', icon: Folder, label: 'New Space' },
                      { id: 'page', icon: Book, label: 'New Page' }
                    ].map((action) => (
                      <button
                        key={action.id}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left"
                        onClick={() => {
                          addTab(action.id === 'chat' ? 'chat' : action.id === 'agent' ? 'agents' : action.id === 'file' ? 'files' : action.id === 'space' ? 'spaces' : 'pages', action.label, { isEmpty: true })
                          setCreateNewModalOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
                        </div>
                        <ArrowElbowDownLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
    
                {/* Recents List */}
                <div className="py-4">
                  {/* Today */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-muted-foreground px-5 mb-2">Today</h4>
                    <div className="px-2 space-y-0.5">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-r-sm opacity-0 group-hover:opacity-100"></div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Log ( MOV )</span>
                            <span className="text-xs text-muted-foreground">— Castro / ... / New database</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Yesterday */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-muted-foreground px-5 mb-2">Yesterday</h4>
                    <div className="px-2 space-y-0.5">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <div className="h-5 w-5 flex items-center justify-center">
                           <div className="w-1.5 h-4 bg-muted-foreground rounded-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Iphone Space Transform</span>
                            <span className="text-xs text-muted-foreground">— Castro / ... / New database</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Past week */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-muted-foreground px-5 mb-2">Past week</h4>
                    <div className="px-2 space-y-0.5">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <Lightbulb className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">aaaa</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Past 30 days */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground px-5 mb-2">Past 30 days</h4>
                    <div className="px-2 space-y-0.5">
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                          <Sparkle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">Castro</span>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">ssss</span>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">ASASAS</span>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-md group transition-colors text-left">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">Titulo</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Ctrl</span>
                    <span>+</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">↵</span>
                    <span className="ml-1">Open in new tab</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Ctrl</span>
                    <span>+</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">L</span>
                    <span className="ml-1">Copy link</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Shift</span>
                    <span>+</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Ctrl</span>
                    <span>+</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">K</span>
                    <span className="ml-1">Command Search</span>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <Gear className="h-4 w-4" />
                </button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
