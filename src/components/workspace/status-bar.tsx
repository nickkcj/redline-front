'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { useWorkspaceStore } from '@/store/workspace-store'
import {
  Columns,
  Layout,
  Square,
  CaretRight,
  CaretLeft,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  Info,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  Check,
  Airplay,
  DotsThree,
  Star,
  Plus,
  PencilSimple,
  Copy,
  ArrowRight,
  Export,
  Trash
} from '@phosphor-icons/react'
import { SquareSplitHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface StatusBarProps {
  breadcrumbs?: Array<{ id: string; label: string }>
  statusMessage?: string
  statusType?: 'idle' | 'loading' | 'success' | 'error' | 'warning'
  zoom?: number
  onZoomChange?: (zoom: number) => void
  splitMode?: 'none' | 'horizontal' | 'vertical'
  onSplitModeChange?: (mode: 'none' | 'horizontal' | 'vertical') => void
  showShareMenu?: boolean
  workspaces?: { id: string; name: string }[]
  activeWorkspaceId?: string
  onWorkspaceChange?: (id: string) => void
  activeTabType?: string
}

import { ShareMenu } from '@/components/features/share/share-menu'

export function StatusBar({
  breadcrumbs = [],
  statusMessage = 'Pronto',
  statusType = 'idle',
  zoom = 100,
  onZoomChange,
  splitMode = 'none',
  onSplitModeChange,
  showShareMenu = false,
  workspaces = [],
  activeWorkspaceId,
  onWorkspaceChange,
  activeTabType
}: StatusBarProps) {
  const { theme, setTheme } = useTheme()
  const [localZoom, setLocalZoom] = React.useState(zoom)
  const { tabs, activeTabId } = useWorkspaceStore()
  
  const activeTab = tabs.find(t => t.id === activeTabId)
  const documentTitle = activeTab?.title || "Untitled"

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0]
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const handleZoomReset = () => {
    setLocalZoom(100)
    onZoomChange?.(100)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(localZoom + 5, 200)
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(localZoom - 5, 50)
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const getStatusIcon = () => {
    switch (statusType) {
      case 'loading':
        return <CircleNotch weight="bold" className="h-3.5 w-3.5 animate-spin text-red-500" />
      case 'success':
        return <CheckCircle weight="fill" className="h-3.5 w-3.5 text-green-500" />
      case 'error':
        return <WarningCircle weight="fill" className="h-3.5 w-3.5 text-red-500" />
      case 'warning':
        return <WarningCircle weight="fill" className="h-3.5 w-3.5 text-yellow-500" />
      default:
        return <Info weight="fill" className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getSplitIcon = () => {
    switch (splitMode) {
      case 'horizontal':
        return <SquareSplitHorizontal className="h-4 w-4" />
      case 'vertical':
        return <Layout weight="bold" className="h-4 w-4" />
      default:
        return <Airplay weight="bold" className="h-4 w-4" />
    }
  }

  return (
    <div className="h-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-3 text-xs select-none">
      {/* Left Section - Breadcrumbs & Status */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Split Mode - Moved to left */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                  >
                    {getSplitIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="text-xs">
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('none')} className="text-xs">
                    <Airplay weight="bold" className="h-3.5 w-3.5 mr-2" />
                    Usar 1 tela
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('horizontal')} className="text-xs">
                    <SquareSplitHorizontal className="h-3.5 w-3.5 mr-2" />
                    Dividir em 2 telas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('vertical')} className="text-xs">
                    <Layout weight="bold" className="h-3.5 w-3.5 mr-2" />
                    Dividir em 3 telas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Modo de divisão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => window.history.back()}
            >
                <CaretLeft weight="bold" className="h-4 w-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => window.history.forward()}
            >
                <CaretRight weight="bold" className="h-4 w-4" />
            </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1.5 text-muted-foreground overflow-hidden">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  {crumb.id === 'workspace' && workspaces.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="hover:text-foreground transition-colors truncate max-w-[120px] flex items-center gap-1"
                          title={crumb.label}
                        >
                          {crumb.label}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[200px]">
                        {workspaces.map((ws) => (
                          <DropdownMenuItem
                            key={ws.id}
                            onClick={() => onWorkspaceChange?.(ws.id)}
                            className="flex items-center justify-between"
                          >
                            <span>{ws.name}</span>
                            {ws.id === activeWorkspaceId && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      className="hover:text-foreground transition-colors truncate max-w-[120px]"
                      title={crumb.label}
                    >
                      {crumb.label}
                    </button>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <CaretRight weight="bold" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Nenhuma janela ativa</span>
          )}
        </div>

        {/* Status Message (moved from center) */}
        {/* {statusType !== 'idle' && (
          <div className="flex items-center gap-2 px-2 border-l border-border/50">
            {getStatusIcon()}
            <span className={cn(
              "text-muted-foreground whitespace-nowrap",
              statusType === 'error' && "text-red-500",
              statusType === 'warning' && "text-yellow-500",
              statusType === 'success' && "text-green-500"
            )}>
              {statusMessage}
            </span>
          </div>
        )} */}
      </div>

      {/* Center Section - Document Info */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
        {activeTabType !== 'chats' && activeTabType !== 'home' && (
          <>
            {/* Share Menu - Moved to center */}
            {showShareMenu && (
              <div className="flex items-center gap-2">
                <ShareMenu />
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-1">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 mr-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleZoomOut}
                  disabled={localZoom <= 50}
                >
                  <MagnifyingGlassMinus weight="bold" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Diminuir zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Slider
            value={[localZoom]}
            onValueChange={handleZoomChange}
            min={50}
            max={200}
            step={5}
            className="cursor-pointer w-24"
          />
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleZoomIn}
                  disabled={localZoom >= 200}
                >
                  <MagnifyingGlassPlus weight="bold" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Aumentar zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={handleZoomReset}
            className="text-muted-foreground hover:text-foreground transition-colors min-w-[32px] text-right font-mono tabular-nums"
          >
            {localZoom}%
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <DotsThree weight="bold" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <div className="px-2 py-1.5 border-b mb-1">
              <p className="text-xs font-medium line-clamp-2 mb-1">{documentTitle}</p>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Created by castronauta (You)</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Last Updated June 22, 2025
              </div>
            </div>
            
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              <span>Add Bookmark</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add to Space</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PencilSimple className="mr-2 h-4 w-4" />
              <span>Rename Thread</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Move</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Export className="mr-2 h-4 w-4" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Export className="mr-2 h-4 w-4" />
              <span>Export as Markdown</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Export className="mr-2 h-4 w-4" />
              <span>Export as DOCX</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
