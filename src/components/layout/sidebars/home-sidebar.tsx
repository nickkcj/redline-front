import * as React from "react"
import { Plus, House, Clock, Star } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

export function HomeSidebar() {
  return (
    <SidebarListBase
      title="Home"
      actions={
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          title="Customize Home"
        >
          <Plus weight="bold" className="mr-2 h-4 w-4" />
          <span>Customize</span>
        </Button>
      }
    >
      <SidebarGroup title="Shortcuts">
        <SidebarListItem icon={Star} label="Starred Items" />
        <SidebarListItem icon={Clock} label="Recent Activity" />
      </SidebarGroup>
      
      <SidebarGroup title="Dashboards">
        <SidebarListItem icon={House} label="Main Dashboard" />
        <SidebarListItem icon={House} label="Analytics Overview" />
      </SidebarGroup>
    </SidebarListBase>
  )
}
