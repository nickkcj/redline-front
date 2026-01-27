'use client'

import * as React from 'react'
import { useWorkspaceStore } from '@/store/workspace-store'
import { TabBar } from './tab-bar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/contexts/search-context'
import { SearchCommand } from './search-command'
import { useSearch } from '@/contexts/search-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HomeView } from './views/home-view'
import { ChatView } from './views/chat-view'
import { DocumentView } from './views/document-view'
// import { DocumentosPage } from '@/app/(dashboard)/documentos/page' // Não pode importar de page.tsx
import { SettingsModal } from './settings-modal'
import { StatusBar } from './status-bar'
import { BaseLayout } from '@/components/layout/base-layout'
import { useStatusBarStore } from '@/hooks/use-status-bar'

function WorkspaceLayoutContent() {
  const { 
    tabs,
    activeTabId,
    activeWorkspaceId,
    workspaces,
    isSplit,
    activeSplitTabId,
    isThreeColumnSplit,
    activeThirdTabId,
    toggleSplit,
    toggleThreeColumnSplit,
    setSplitTab,
    setThirdTab,
    reorderColumns,
    splitChoiceDialogOpen,
    pendingSplitTabId,
    setSplitChoiceDialogOpen,
    setPendingSplitTabId,
    setActiveTab
  } = useWorkspaceStore()

  const activeTab = tabs.find(t => t.id === activeTabId)
  const splitTab = tabs.find(t => t.id === activeSplitTabId)
  const thirdTab = tabs.find(t => t.id === activeThirdTabId)
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]
  
  // Split Resize State
  const [splitWidth, setSplitWidth] = React.useState(50) // Percentage
  const [thirdColumnWidth, setThirdColumnWidth] = React.useState(33.33) // Percentage for 3-column
  const [isResizingSplit, setIsResizingSplit] = React.useState(false)
  const splitResizeRef = React.useRef<HTMLDivElement>(null)
  const hasResizedSplit = React.useRef(false)
  
  // Focused Panel State (for breadcrumb)
  const [focusedPanel, setFocusedPanel] = React.useState<'main' | 'split' | 'third'>('main')
  
  // Drag and Drop State
  const [draggedColumn, setDraggedColumn] = React.useState<'main' | 'split' | 'third' | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<'main' | 'split' | 'third' | null>(null)
  
  // Status Bar State
  const [zoom, setZoom] = React.useState(100)
  const { message: statusMessage, type: statusType, setSuccess } = useStatusBarStore()
  
  // Determine which tab to show in breadcrumb
  const breadcrumbTab = isSplit 
    ? (focusedPanel === 'main' ? activeTab : focusedPanel === 'split' ? splitTab : thirdTab)
    : activeTab

  // Build breadcrumbs for StatusBar
  const statusBarBreadcrumbs = React.useMemo(() => {
    const crumbs = []
    if (activeWorkspace) {
      crumbs.push({ id: 'workspace', label: activeWorkspace.name })
    }
    if (breadcrumbTab) {
      crumbs.push({ id: breadcrumbTab.id, label: breadcrumbTab.title })
    }
    if (isSplit && isThreeColumnSplit) {
      crumbs.push({ id: 'mode', label: '3 telas' })
    } else if (isSplit) {
      crumbs.push({ id: 'mode', label: '2 telas' })
    }
    return crumbs
  }, [activeWorkspace, breadcrumbTab, isSplit, isThreeColumnSplit])

  // Handle split mode changes from StatusBar
  const handleSplitModeChange = React.useCallback((mode: 'none' | 'horizontal' | 'vertical') => {
    if (mode === 'none') {
      if (isSplit) {
        toggleSplit()
        setSuccess('Usando 1 tela')
      }
    } else if (mode === 'horizontal') {
      if (!isSplit) toggleSplit()
      if (isThreeColumnSplit) toggleThreeColumnSplit()
      setSuccess('Dividido em 2 telas')
    } else if (mode === 'vertical') {
      if (!isSplit) toggleSplit()
      if (!isThreeColumnSplit) toggleThreeColumnSplit()
      setSuccess('Dividido em 3 telas')
    }
  }, [isSplit, isThreeColumnSplit, toggleSplit, toggleThreeColumnSplit, setSuccess])

  const currentSplitMode = isThreeColumnSplit ? 'vertical' : isSplit ? 'horizontal' : 'none'

  // Split Resize Handlers
  const startResizingSplit = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizingSplit(true)
    hasResizedSplit.current = false
  }, [])

  const stopResizingSplit = React.useCallback(() => {
    setIsResizingSplit(false)
  }, [])

  const resizeSplit = React.useCallback(
    (e: MouseEvent) => {
      if (isResizingSplit && splitResizeRef.current) {
        hasResizedSplit.current = true
        const container = splitResizeRef.current.parentElement
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const relativeX = e.clientX - containerRect.left
          const percentage = (relativeX / containerRect.width) * 100
          
          // Limit between 20% and 80%
          const clampedPercentage = Math.max(20, Math.min(80, percentage))
          setSplitWidth(clampedPercentage)
        }
      }
    },
    [isResizingSplit]
  )

  React.useEffect(() => {
    if (isResizingSplit) {
      window.addEventListener("mousemove", resizeSplit)
      window.addEventListener("mouseup", stopResizingSplit)
      return () => {
        window.removeEventListener("mousemove", resizeSplit)
        window.removeEventListener("mouseup", stopResizingSplit)
      }
    }
  }, [isResizingSplit, resizeSplit, stopResizingSplit])

  const renderTabContent = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return <div className="p-8 text-muted-foreground">Tab not found</div>

    switch (tab.type) {
      case 'home':
        return <HomeView />
      case 'chat':
        return <ChatView tabId={tab.id} tabData={tab.data} />
      case 'document':
        return <DocumentView tabId={tab.id} tabData={tab.data} />
      case 'files':
        return <div className="p-4">Files view - TODO: criar componente separado</div>
      case 'spaces':
        return <div className="p-8">Spaces View Placeholder</div>
      case 'agents':
        return <div className="p-8">Agents View Placeholder</div>
      case 'pages':
        return <div className="p-8">Pages View Placeholder</div>
      case 'templates':
        return <div className="p-8">Templates View Placeholder</div>
      default:
        return <div>Unknown tab type</div>
    }
  }

  const renderSplitSelection = (isThirdColumn: boolean = false) => {
    const availableTabs = tabs.filter(t => 
      t.id !== activeTabId && 
      (!isThirdColumn || t.id !== activeSplitTabId)
    )
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 p-4 h-full">
        <div className="w-full max-w-md space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-medium">Select a tab to view</h3>
                <p className="text-sm text-muted-foreground">
                  {isThirdColumn ? "Choose an open tab to display in third column" : "Choose an open tab to display in split view"}
                </p>
            </div>
            <div className="grid gap-2">
            {availableTabs.map(tab => (
                <Button 
                key={tab.id} 
                variant="outline" 
                className="justify-start w-full"
                onClick={() => {
                  if (isThirdColumn) {
                    setThirdTab(tab.id)
                  } else if (pendingSplitTabId) {
                    handleSplitPanelChoice(tab.id)
                  } else {
                    setSplitTab(tab.id)
                  }
                }}
                >
                {tab.title}
                </Button>
            ))}
            {availableTabs.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No other tabs open.</p>
                </div>
            )}
            </div>
        </div>
      </div>
    )
  }

  const handleSplitPanelChoice = (chosenTabId: string) => {
    if (pendingSplitTabId) {
      // If user chose a different tab, put the new tab in the main view and chosen tab in split
      setActiveTab(pendingSplitTabId)
      setSplitTab(chosenTabId)
    } else {
      // If no pending tab, just set the split tab
      setSplitTab(chosenTabId)
    }
    setSplitChoiceDialogOpen(false)
    setPendingSplitTabId(null)
  }

  const handleUseNewTabInSplit = () => {
    if (pendingSplitTabId) {
      setSplitTab(pendingSplitTabId)
      setSplitChoiceDialogOpen(false)
      setPendingSplitTabId(null)
    }
  }

  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch()

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, column: 'main' | 'split' | 'third') => {
    if (!isThreeColumnSplit) return
    setDraggedColumn(column)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', column)
  }

  const handleDragOver = (e: React.DragEvent, column: 'main' | 'split' | 'third') => {
    if (!isThreeColumnSplit || !draggedColumn || draggedColumn === column) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(column)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumn: 'main' | 'split' | 'third') => {
    if (!isThreeColumnSplit || !draggedColumn || draggedColumn === targetColumn) return
    
    e.preventDefault()
    
    // Criar nova ordem baseada no drag
    const currentOrder = {
      main: activeTabId!,
      split: activeSplitTabId!,
      third: activeThirdTabId!
    }
    
    // Trocar as posições
    const newOrder = { ...currentOrder }
    const temp = newOrder[draggedColumn]
    newOrder[draggedColumn] = newOrder[targetColumn]
    newOrder[targetColumn] = temp
    
    // Aplicar nova ordem
    reorderColumns(newOrder)
    
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  // Reset split width and focused panel when split is toggled off
  React.useEffect(() => {
    if (!isSplit) {
      setSplitWidth(50)
      setThirdColumnWidth(33.33)
      setFocusedPanel('main')
    }
  }, [isSplit])
  
  // Reset widths when switching to/from 3 column mode
  React.useEffect(() => {
    if (isThreeColumnSplit) {
      setThirdColumnWidth(33.33)
    } else {
      setSplitWidth(50)
    }
  }, [isThreeColumnSplit])
  
  // Reset focused panel to main when split tab changes
  React.useEffect(() => {
    if (isSplit && !activeSplitTabId) {
      setFocusedPanel('main')
    }
  }, [isSplit, activeSplitTabId])

  return (
    <BaseLayout>
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Top Bar: Tabs Only */}
        <div className="flex items-end border-b h-10 bg-muted/10">
          {/* Tabs Area */}
          <div className="flex-1 flex items-end overflow-hidden min-w-0">
             <TabBar />
          </div>
        </div>

        {/* View Content */}
        <main 
          ref={splitResizeRef}
          className="flex-1 overflow-hidden bg-background flex flex-row relative"
        >
           <div 
             className={cn(
               "overflow-auto h-full", 
               isSplit ? "border-r" : "w-full",
               isThreeColumnSplit && "cursor-grab active:cursor-grabbing",
               isThreeColumnSplit && draggedColumn === 'main' && "opacity-50",
               isThreeColumnSplit && dragOverColumn === 'main' && "ring-2 ring-primary ring-offset-2"
             )}
             style={isSplit ? { width: isThreeColumnSplit ? `${thirdColumnWidth}%` : `${splitWidth}%` } : {}}
             onClick={() => isSplit && setFocusedPanel('main')}
             draggable={isThreeColumnSplit}
             onDragStart={(e) => handleDragStart(e, 'main')}
             onDragOver={(e) => handleDragOver(e, 'main')}
             onDragLeave={handleDragLeave}
             onDrop={(e) => handleDrop(e, 'main')}
             onDragEnd={handleDragEnd}
           >
              {activeTabId ? renderTabContent(activeTabId) : <div className="p-8">No active tab</div>}
           </div>
           
           {isSplit && (
             <>
               {/* Split Resizer Handle */}
               <div
                 className="w-1 hover:w-1.5 z-50 cursor-col-resize flex flex-col justify-center group relative h-full hover:bg-primary/10 transition-colors"
                 onMouseDown={startResizingSplit}
               >
                 {/* Visual line */}
                 <div className="absolute inset-y-0 left-1/2 w-px bg-transparent group-hover:bg-primary/50 transition-colors" />
               </div>
               
               <div 
                 className={cn(
                   "overflow-auto h-full bg-background", 
                   isThreeColumnSplit && "border-r cursor-grab active:cursor-grabbing",
                   isThreeColumnSplit && draggedColumn === 'split' && "opacity-50",
                   isThreeColumnSplit && dragOverColumn === 'split' && "ring-2 ring-primary ring-offset-2"
                 )}
                 style={{ width: isThreeColumnSplit ? `${thirdColumnWidth}%` : `${100 - splitWidth}%` }}
                 onClick={() => setFocusedPanel('split')}
                 draggable={isThreeColumnSplit}
                 onDragStart={(e) => handleDragStart(e, 'split')}
                 onDragOver={(e) => handleDragOver(e, 'split')}
                 onDragLeave={handleDragLeave}
                 onDrop={(e) => handleDrop(e, 'split')}
                 onDragEnd={handleDragEnd}
               >
                 {activeSplitTabId ? renderTabContent(activeSplitTabId) : renderSplitSelection()}
               </div>
               
               {/* Third Column */}
               {isThreeColumnSplit && (
                 <>
                   {/* Third Column Resizer Handle */}
                   <div
                     className="w-1 hover:w-1.5 z-50 cursor-col-resize flex flex-col justify-center group relative h-full hover:bg-primary/10 transition-colors"
                   >
                     {/* Visual line */}
                     <div className="absolute inset-y-0 left-1/2 w-px bg-transparent group-hover:bg-primary/50 transition-colors" />
                   </div>
                   
                   <div 
                     className={cn(
                       "overflow-auto h-full bg-background cursor-grab active:cursor-grabbing",
                       draggedColumn === 'third' && "opacity-50",
                       dragOverColumn === 'third' && "ring-2 ring-primary ring-offset-2"
                     )}
                     style={{ width: `${100 - (thirdColumnWidth * 2)}%` }}
                     onClick={() => setFocusedPanel('third')}
                     draggable={isThreeColumnSplit}
                     onDragStart={(e) => handleDragStart(e, 'third')}
                     onDragOver={(e) => handleDragOver(e, 'third')}
                     onDragLeave={handleDragLeave}
                     onDrop={(e) => handleDrop(e, 'third')}
                     onDragEnd={handleDragEnd}
                   >
                     {activeThirdTabId ? renderTabContent(activeThirdTabId) : renderSplitSelection(true)}
                   </div>
                 </>
               )}
             </>
           )}
        </main>

        {/* Status Bar */}
        <StatusBar
          breadcrumbs={statusBarBreadcrumbs}
          statusMessage={statusMessage}
          statusType={statusType}
          zoom={zoom}
          onZoomChange={setZoom}
          splitMode={currentSplitMode}
          onSplitModeChange={handleSplitModeChange}
        />
      </div>

      <SettingsModal />
      <SearchCommand open={isSearchOpen} setOpen={(open) => open ? openSearch() : closeSearch()} />
      
      {/* Split Panel Choice Dialog */}
      <Dialog open={splitChoiceDialogOpen} onOpenChange={setSplitChoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolher Painel Dividido</DialogTitle>
            <DialogDescription>
              Selecione qual aba deve ser exibida no painel dividido
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {/* Option to use the new tab in split */}
            {pendingSplitTabId && (() => {
              const newTab = tabs.find(t => t.id === pendingSplitTabId)
              return (
                <Button
                  variant="outline"
                  className="justify-start w-full font-medium"
                  onClick={handleUseNewTabInSplit}
                >
                  {newTab?.title || 'Nova aba'} (usar no painel dividido)
                </Button>
              )
            })()}
            {/* All available tabs */}
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant="outline"
                className="justify-start w-full"
                onClick={() => handleSplitPanelChoice(tab.id)}
                disabled={tab.id === activeTabId || tab.id === pendingSplitTabId}
              >
                {tab.title}
                {tab.id === activeTabId && ' (atual)'}
                {tab.id === pendingSplitTabId && ' (nova)'}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </BaseLayout>
  )
}

export function WorkspaceLayout() {
  return (
    <SearchProvider>
      <WorkspaceLayoutContent />
    </SearchProvider>
  )
}
