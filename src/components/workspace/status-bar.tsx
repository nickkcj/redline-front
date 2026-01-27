'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Sun,
  Moon,
  SplitHorizontal,
  SplitVertical,
  Square,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  Info,
  CheckCircle,
  WarningCircle,
  CircleNotch
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatusBarProps {
  breadcrumbs?: Array<{ id: string; label: string }>
  statusMessage?: string
  statusType?: 'idle' | 'loading' | 'success' | 'error' | 'warning'
  zoom?: number
  onZoomChange?: (zoom: number) => void
  splitMode?: 'none' | 'horizontal' | 'vertical'
  onSplitModeChange?: (mode: 'none' | 'horizontal' | 'vertical') => void
}

export function StatusBar({
  breadcrumbs = [],
  statusMessage = 'Pronto',
  statusType = 'idle',
  zoom = 100,
  onZoomChange,
  splitMode = 'none',
  onSplitModeChange
}: StatusBarProps) {
  const { theme, setTheme } = useTheme()
  const [localZoom, setLocalZoom] = React.useState(zoom)

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
    const newZoom = Math.min(localZoom + 10, 200)
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(localZoom - 10, 50)
    setLocalZoom(newZoom)
    onZoomChange?.(newZoom)
  }

  const getStatusIcon = () => {
    switch (statusType) {
      case 'loading':
        return <CircleNotch weight="bold" className="h-3.5 w-3.5 animate-spin text-blue-500" />
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
        return <SplitHorizontal weight="bold" className="h-4 w-4" />
      case 'vertical':
        return <SplitVertical weight="bold" className="h-4 w-4" />
      default:
        return <Square weight="bold" className="h-4 w-4" />
    }
  }

  return (
    <div className="h-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-3 text-xs select-none">
      {/* Left Section - Breadcrumbs */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-1.5 text-muted-foreground overflow-hidden">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <button
                  className="hover:text-foreground transition-colors truncate max-w-[120px]"
                  title={crumb.label}
                >
                  {crumb.label}
                </button>
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

      {/* Center Section - Status Message */}
      <div className="flex items-center gap-2 px-4">
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

      {/* Right Section - Controls */}
      <div className="flex items-center gap-1">
        {/* Split Mode */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {getSplitIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="text-xs">
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('none')} className="text-xs">
                    <Square weight="bold" className="h-3.5 w-3.5 mr-2" />
                    Usar 1 tela
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('horizontal')} className="text-xs">
                    <SplitHorizontal weight="bold" className="h-3.5 w-3.5 mr-2" />
                    Dividir em 2 telas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSplitModeChange?.('vertical')} className="text-xs">
                    <SplitVertical weight="bold" className="h-3.5 w-3.5 mr-2" />
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

        <div className="w-px h-4 bg-border mx-1" />

        {/* Theme Toggle */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun weight="bold" className="h-4 w-4" />
                ) : (
                  <Moon weight="bold" className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Zoom Controls */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
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

        {/* Zoom Slider */}
        <div className="flex items-center gap-2 w-32">
          <Slider
            value={[localZoom]}
            onValueChange={handleZoomChange}
            min={50}
            max={200}
            step={10}
            className="cursor-pointer"
          />
          <button
            onClick={handleZoomReset}
            className="text-muted-foreground hover:text-foreground transition-colors min-w-[40px] text-right font-mono"
          >
            {localZoom}%
          </button>
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
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
      </div>
    </div>
  )
}
