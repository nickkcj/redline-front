import * as React from "react"
import { Plus, Book } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

export function PagesSidebar() {
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
      <SidebarGroup title="Drafts">
        <SidebarListItem icon={Book} label="Untitled Page" />
        <SidebarListItem icon={Book} label="Meeting Notes - Jan 27" />
      </SidebarGroup>
      
      <SidebarGroup title="Published">
        <SidebarListItem icon={Book} label="Company Handbook" />
        <SidebarListItem icon={Book} label="Brand Guidelines" />
        <SidebarListItem icon={Book} label="API Documentation" />
      </SidebarGroup>
    </SidebarListBase>
  )
}
