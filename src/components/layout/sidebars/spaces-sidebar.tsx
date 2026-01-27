import * as React from "react"
import { Plus, Folder } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

export function SpacesSidebar() {
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
      <SidebarGroup title="Favorites">
        <SidebarListItem icon={Folder} label="Marketing Team" />
        <SidebarListItem icon={Folder} label="Product Design" />
      </SidebarGroup>
      
      <SidebarGroup title="Recent">
        <SidebarListItem icon={Folder} label="Q1 Planning" />
        <SidebarListItem icon={Folder} label="Website Redesign" />
        <SidebarListItem icon={Folder} label="Mobile App Launch" />
      </SidebarGroup>
    </SidebarListBase>
  )
}
