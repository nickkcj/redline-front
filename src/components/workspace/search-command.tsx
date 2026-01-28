'use client'

import * as React from 'react'
import {
  FileText,
  MagnifyingGlass,
  Monitor,
  VideoCamera,
  Sun,
  Layout,
  ShoppingCart,
  GameController,
  Archive,
  ArrowsDownUp,
  User,
  GridFour,
  File,
  Calendar,
  Funnel
} from "@phosphor-icons/react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from '@/components/ui/button'

export function SearchCommand({
  open,
  setOpen
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  // Note: Cmd+K shortcut is now handled globally in SearchProvider
  const [selectedValue, setSelectedValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleInputFocus = () => {
    // Clear selection when input is focused
    setSelectedValue("")
  }

  React.useEffect(() => {
    if (open) {
      // Reset selection when dialog opens
      setSelectedValue("")
      // Focus the input after a short delay to ensure it's mounted
      setTimeout(() => {
        inputRef.current?.focus()
        setSelectedValue("") // Clear again after focus
      }, 100)
    } else {
      // Reset when dialog closes
      setSelectedValue("")
    }
  }, [open])

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen} 
      className="max-w-4xl w-full"
      commandValue={selectedValue}
      onCommandValueChange={setSelectedValue}
    >
      <div className="flex flex-col gap-0">
        <CommandInput 
          ref={inputRef}
          placeholder="Search or ask a question in Space..."
          onFocus={handleInputFocus}
        />
        
        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-2 border-b bg-muted/10 text-xs text-muted-foreground overflow-x-auto no-scrollbar">
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <ArrowsDownUp weight="bold" className="h-3 w-3" />
              <span>Sort</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <span className="font-serif italic">Aa</span>
              <span>Title only</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Created by</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <GridFour weight="bold" className="h-3 w-3" />
              <span>Teamspace</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <File className="h-3 w-3" />
              <span>In</span>
           </Button>
           <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Date</span>
           </Button>
        </div>
      </div>

      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Today">
          <CommandItem value="Alienware Ana">
            <Monitor className="mr-2 h-4 w-4 text-orange-500 shrink-0" />
            <span className="font-medium truncate flex-1 min-w-0">Alienware Ana</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / Dashboard</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Past week">
          <CommandItem value="Log (MOV)">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">Log (MOV)</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / ... / New database</CommandShortcut>
          </CommandItem>
          <CommandItem value="Davinci">
            <VideoCamera weight="bold" className="mr-2 h-4 w-4 text-orange-400 shrink-0" />
            <span className="truncate flex-1 min-w-0">Davinci</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / ... / Course</CommandShortcut>
          </CommandItem>
          <CommandItem value="Castro">
            <Sun className="mr-2 h-4 w-4 text-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">Castro</span>
          </CommandItem>
          <CommandItem value="Juliana">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">Juliana Deputada.</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / Dashboard</CommandShortcut>
          </CommandItem>
          <CommandItem value="Brave">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">Brave</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / ... / Notas</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Past 30 days">
          <CommandItem value="COMPRA MOVAVI CONVERTER">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">COMPRA MOVAVI CONVERTER</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / ... / Notas</CommandShortcut>
          </CommandItem>
          <CommandItem value="Valorant">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">Valorant</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro</CommandShortcut>
          </CommandItem>
          <CommandItem value="ARC">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 min-w-0">ARC</span>
            <CommandShortcut className="text-[10px] text-muted-foreground/60 border-0 ml-2">Castro / ... / Notas</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      
      {/* Footer */}
      <div className="border-t p-2 px-4 text-[10px] text-muted-foreground flex justify-between items-center bg-muted/5">
         <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="bg-muted px-1 rounded">Ctrl</span> + <span className="bg-muted px-1 rounded">Enter</span> Open in new tab</span>
            <span className="flex items-center gap-1"><span className="bg-muted px-1 rounded">Ctrl</span> + <span className="bg-muted px-1 rounded">L</span> Copy link</span>
            <span className="flex items-center gap-1"><span className="bg-muted px-1 rounded">Shift</span> + <span className="bg-muted px-1 rounded">Ctrl</span> + <span className="bg-muted px-1 rounded">K</span> Command Search</span>
         </div>
      </div>
    </CommandDialog>
  )
}
