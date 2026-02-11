import * as React from "react"
import { Plus, Folder } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase } from "./sidebar-base"

export function SpacesSidebar() {
  // TODO: Fetch spaces from API
  const spaces: any[] = []

  return (
    <SidebarListBase
      title="Spaces"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          title="Create a Space"
        >
          <Plus weight="bold" className="mr-2 h-4 w-4" />
          <span>Create a Space</span>
        </Button>
      }
    >
      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Folder className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No spaces yet</p>
          <p className="text-xs text-muted-foreground/70">Create a space to organize your work</p>
        </div>
      ) : null}
    </SidebarListBase>
  )
}
