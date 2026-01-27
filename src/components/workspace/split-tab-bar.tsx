'use client'

import * as React from 'react'
import { X, FileText, House, ChatCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace-store'

export function SplitTabBar() {
  const { 
    tabs, 
    activeTabId, 
    activeSplitTabId, 
    setActiveTab, 
    closeSplitTab 
  } = useWorkspaceStore()

  const activeTab = tabs.find(t => t.id === activeTabId)
  const splitTab = tabs.find(t => t.id === activeSplitTabId)

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return House
      case 'chat': return ChatCircle
      case 'document': return FileText
      default: return FileText
    }
  }

  if (!activeTab) return null

  return (
    <div className="flex h-full items-end gap-0 overflow-hidden min-w-0 bg-muted/10 rounded-t-md border-b border-border">
      {/* Primeira aba - Principal */}
      <div
        onClick={() => setActiveTab(activeTab.id)}
        className={cn(
          "group relative flex h-8 min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 rounded-tl-md border-r border-b-0 border-t border-l px-3 text-xs font-medium transition-colors select-none",
          "bg-background text-foreground border-border shadow-sm"
        )}
      >
        {(() => {
          const Icon = getIcon(activeTab.type)
          return <Icon className="h-3.5 w-3.5 shrink-0" />
        })()}
        <span className="truncate flex-1">{activeTab.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            closeSplitTab('main')
          }}
          className={cn(
            "rounded-sm p-0.5 hover:bg-muted-foreground/20 opacity-100 transition-opacity"
          )}
        >
          <X className="h-3 w-3" />
        </button>
        
        {/* Active Indicator Line */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-background" />
      </div>

      {/* Segunda aba - Split */}
      {splitTab ? (
        <div
          onClick={() => setActiveTab(splitTab.id)}
          className={cn(
            "group relative flex h-8 min-w-[120px] max-w-[200px] cursor-pointer items-center gap-2 rounded-tr-md border-r border-b-0 border-t border-l-0 px-3 text-xs font-medium transition-colors select-none",
            "bg-background text-foreground border-border shadow-sm"
          )}
        >
          {(() => {
            const Icon = getIcon(splitTab.type)
            return <Icon className="h-3.5 w-3.5 shrink-0" />
          })()}
          <span className="truncate flex-1">{splitTab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeSplitTab('split')
            }}
            className={cn(
              "rounded-sm p-0.5 hover:bg-muted-foreground/20 opacity-100 transition-opacity"
            )}
          >
            <X className="h-3 w-3" />
          </button>
          
          {/* Active Indicator Line */}
          <div className="absolute -bottom-px left-0 right-0 h-px bg-background" />
        </div>
      ) : (
        <div className="flex h-8 min-w-[120px] max-w-[200px] items-center gap-2 rounded-tr-md border-r border-b-0 border-t border-l-0 border-transparent px-3 text-xs font-medium text-muted-foreground">
          <span className="truncate flex-1">Selecionar aba...</span>
        </div>
      )}
    </div>
  )
}
