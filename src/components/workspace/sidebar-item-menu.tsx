'use client'

import * as React from 'react'
import {
  Star,
  Download,
  Link as LinkIcon,
  Copy,
  Stack,
  PencilSimple,
  ArrowRight,
  Trash,
  ArrowCounterClockwise,
  ArrowSquareOut,
  Square,
  Columns,
  DotsThree,
} from '@phosphor-icons/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SidebarItemMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  type: 'chat' | 'document'
  itemId?: string
  onOpen?: () => void
  onOpenInNewTab?: () => void
  onOpenInNewWindow?: () => void
  onOpenInSidePeek?: () => void
  onCopyLink?: () => void
  onDuplicate?: () => void
  onRename?: () => void
  onMoveTo?: () => void
  onMoveToTrash?: () => void
  onAddToFavorites?: () => void
  lastEditedBy?: string
  lastEditedAt?: string
  trigger?: React.ReactNode
}

export function SidebarItemMenu({
  open,
  onOpenChange,
  title,
  type,
  itemId,
  onOpen,
  onOpenInNewTab,
  onOpenInNewWindow,
  onOpenInSidePeek,
  onCopyLink,
  onDuplicate,
  onRename,
  onMoveTo,
  onMoveToTrash,
  onAddToFavorites,
  lastEditedBy = 'Castro',
  lastEditedAt = 'Aug 2, 2025, 10:57 AM',
  trigger,
}: SidebarItemMenuProps) {
  const [availableOffline, setAvailableOffline] = React.useState(false)

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink()
    } else {
      // Default behavior
      const link = `${window.location.origin}/${type}/${itemId || 'new'}`
      navigator.clipboard.writeText(link)
    }
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent 
        side="right" 
        align="start"
        sideOffset={8}
        className="p-0 w-[280px] rounded-md shadow-lg"
      >
        <div className="px-3 pt-3 pb-2">
          <div className="text-sm font-medium">{title || 'Page'}</div>
        </div>
        
        <div className="flex flex-col">
          {/* Page Management Section */}
          <div className="px-1 py-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onAddToFavorites) onAddToFavorites()
                onOpenChange(false)
              }}
            >
              <Star className="h-4 w-4" />
              <span>Add to Favorites</span>
            </Button>
            
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 h-8">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Available offline</span>
              </div>
              <Switch
                checked={availableOffline}
                onCheckedChange={setAvailableOffline}
                className="h-4 w-4"
              />
            </div>
          </div>

          <Separator />

          {/* Core Actions Section */}
          <div className="px-1 py-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal"
              onClick={handleCopyLink}
            >
              <LinkIcon className="h-4 w-4" />
              <span>Copy link</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onDuplicate) onDuplicate()
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-2">
                <SquareStack className="h-4 w-4" />
                <span>Duplicate</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>D
              </kbd>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onRename) onRename()
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                <span>Rename</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>+<span className="text-xs">Shift</span>R
              </kbd>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onMoveTo) onMoveTo()
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Move to</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>+<span className="text-xs">Shift</span>P
              </kbd>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (onMoveToTrash) onMoveToTrash()
                onOpenChange(false)
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Move to Trash</span>
            </Button>
          </div>

          <Separator />

          {/* Transformation Section */}
          <div className="px-1 py-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                // Turn into wiki action
                onOpenChange(false)
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Turn into wiki</span>
            </Button>
          </div>

          <Separator />

          {/* Opening Options Section */}
          <div className="px-1 py-1">
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onOpenInNewTab) onOpenInNewTab()
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Open in new tab</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>+<span className="text-xs">Shift</span>↑
              </kbd>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onOpenInNewWindow) onOpenInNewWindow()
                onOpenChange(false)
              }}
            >
              <Square className="h-4 w-4" />
              <span>Open in new window</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 h-8 px-2 text-sm font-normal"
              onClick={() => {
                if (onOpenInSidePeek) onOpenInSidePeek()
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-2">
                <Columns className="h-4 w-4" />
                <span>Open in side peek</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                Alt+Click
              </kbd>
            </Button>
          </div>

          {/* Footer */}
          <Separator />
          <div className="px-3 py-2 text-[10px] text-muted-foreground">
            <div>Last edited by {lastEditedBy}</div>
            <div>{lastEditedAt}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
