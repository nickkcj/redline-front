"use client"

import * as React from "react"
import { MessageSquare, Settings, Folder } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "./organization-switcher"
import { NavMain } from "@/components/shared/navigation/nav-main"
import { NavSecondary } from "@/components/shared/navigation/nav-secondary"
import { NavUser } from "./nav-user"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"
import { useSidebarControl } from "@/contexts/sidebar-control-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const { documentsOpen, toggleDocuments } = useSidebarControl()

  // Build navigation items based on current org/workspace
  const navMainItems = React.useMemo(() => {
    if (!currentOrganization || !currentWorkspace) {
      return []
    }

    return [
      {
        title: "Chat",
        url: `/org/${currentOrganization.id}/workspace/${currentWorkspace.id}`,
        icon: MessageSquare,
      },
      {
        title: "Administração",
        url: `/org/${currentOrganization.id}/workspace/${currentWorkspace.id}/admin`,
        icon: Settings,
      },
    ]
  }, [currentOrganization, currentWorkspace])

  const navSecondaryItems = React.useMemo(() => {
    return [
      {
        title: "Documentos",
        icon: Folder,
        onClick: toggleDocuments,
        isActive: documentsOpen,
      },
    ]
  }, [toggleDocuments, documentsOpen])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
