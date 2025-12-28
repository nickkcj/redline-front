"use client"

import * as React from "react"
import { MessageSquare, Settings, Folder } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "./organization-switcher"
import { NavMain } from "@/components/shared/navigation/nav-main"
import { NavSecondary } from "@/components/shared/navigation/nav-secondary"
import { NavUser } from "./nav-user"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"
import { useSidebarControl } from "@/contexts/sidebar-control-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const { documentsOpen, toggleDocuments } = useSidebarControl()

  const handleLogoClick = () => {
    router.push('/org')
  }

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
      <SidebarHeader className="border-b border-sidebar-border">
        {/* Logo Dooor */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleLogoClick}
              className="cursor-pointer hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Image
                  src="/seloDooorBlack.png"
                  alt="Logo Dooor"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <span className="font-bold text-lg">Dooor</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Organization Switcher */}
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
