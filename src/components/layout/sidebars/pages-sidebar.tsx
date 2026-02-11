import * as React from "react"
import { Plus, Book } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase } from "./sidebar-base"

export function PagesSidebar() {
  // TODO: Fetch pages from API
  const pages: any[] = []

  return (
    <SidebarListBase
      title="Pages"
      actions={
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          title="New Page"
        >
          <Plus weight="bold" className="mr-2 h-4 w-4" />
          <span>New Page</span>
        </Button>
      }
    >
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Book className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No pages yet</p>
          <p className="text-xs text-muted-foreground/70">Create a page to get started</p>
        </div>
      ) : null}
    </SidebarListBase>
  )
}
