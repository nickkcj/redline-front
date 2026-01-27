import * as React from "react"
import { Plus, Layout } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase, SidebarGroup, SidebarListItem } from "./sidebar-base"

export function TemplatesSidebar() {
  return (
    <SidebarListBase
      title="Templates"
      actions={
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-9 px-2 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          title="New Template"
        >
          <Plus weight="bold" className="mr-2 h-4 w-4" />
          <span>New Template</span>
        </Button>
      }
    >
      <SidebarGroup title="Custom">
        <SidebarListItem icon={Layout} label="Weekly Report" />
        <SidebarListItem icon={Layout} label="Project Proposal" />
      </SidebarGroup>
      
      <SidebarGroup title="System">
        <SidebarListItem icon={Layout} label="Meeting Agenda" />
        <SidebarListItem icon={Layout} label="Bug Report" />
        <SidebarListItem icon={Layout} label="Feature Request" />
      </SidebarGroup>
    </SidebarListBase>
  )
}
