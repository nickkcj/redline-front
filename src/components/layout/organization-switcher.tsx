"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"
import { useOrganizations } from "@/hooks/api/use-organization"

export function OrganizationSwitcher() {
  const router = useRouter()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const { data: organizations = [], isLoading } = useOrganizations()

  const handleSwitch = (orgId: string, workspaceId: string) => {
    router.push(`/org/${orgId}/workspace/${workspaceId}`)
  }

  const handleViewAll = () => {
    router.push('/org')
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded w-24 mb-1" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Image
                  src="/seloDooorBlack.png"
                  alt="Logo Dooor"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentWorkspace?.name || 'Workspace'}
                </span>
                <span className="truncate text-xs">
                  {currentOrganization?.name || 'Organization'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>

            {organizations.map((org) => (
              <React.Fragment key={org.id}>
                <DropdownMenuLabel className="font-semibold">
                  {org.name}
                </DropdownMenuLabel>
                {org.workspaces && org.workspaces.length > 0 ? (
                  org.workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleSwitch(org.id, workspace.id)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <span className="text-xs font-medium">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{workspace.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                    Nenhum workspace
                  </DropdownMenuItem>
                )}
              </React.Fragment>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleViewAll}>
              Ver todas organizações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
