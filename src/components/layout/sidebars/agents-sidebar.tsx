import * as React from "react"
import { Plus, Graph } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

export function AgentsSidebar() {
  return (
    <SidebarListBase
      title="Agents"
      actions={
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          title="New Agent"
        >
          <Plus weight="bold" className="mr-2 h-4 w-4" />
          <span>New Agent</span>
        </Button>
      }
    >
      <SidebarGroup title="My Agents">
        <SidebarListItem icon={Graph} label="Research Assistant" />
        <SidebarListItem icon={Graph} label="Code Reviewer" />
        <SidebarListItem icon={Graph} label="Content Writer" />
      </SidebarGroup>
      
      <SidebarGroup title="Shared">
        <SidebarListItem icon={Graph} label="Customer Support Bot" />
        <SidebarListItem icon={Graph} label="Data Analyst" />
      </SidebarGroup>
    </SidebarListBase>
  )
}
