'use client'

import * as React from 'react'
import { Check, CaretUpDown, Plus, Gear, SignOut, Briefcase } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspaceStore } from '@/store/workspace-store'

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, setSettingsOpen } = useWorkspaceStore()
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-6 hover:bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div className="flex items-center gap-3 text-left">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarImage src="" />
              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                {activeWorkspace.icon}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium leading-none">
                {activeWorkspace.name}
              </span>
              <span className="truncate text-xs text-muted-foreground mt-1">
                {activeWorkspace.plan}
              </span>
            </div>
          </div>
          <CaretUpDown weight="bold" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px] text-sm" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {activeWorkspace.name}
        </DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => setActiveWorkspace(workspace.id)}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border bg-background">
                 <span className="text-xs">{workspace.icon}</span>
              </div>
              <span className="truncate">{workspace.name}</span>
            </div>
            {workspace.id === activeWorkspaceId && (
              <Check weight="bold" className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm">
          <Plus weight="bold" className="h-4 w-4" />
          <span>Create workspace</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm" onSelect={() => setSettingsOpen(true)}>
          <Gear weight="bold" className="h-4 w-4" />
          <span>Workspace settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-sm">
          <Briefcase weight="bold" className="h-4 w-4" />
          <span>Invite members</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-sm">
          <SignOut weight="bold" className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
