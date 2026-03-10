"use client"

import * as React from "react"
import { ChatCircle, House, Bell, ShieldCheck } from "@phosphor-icons/react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"

import { useAuth } from "@/components/providers/auth-provider"
import { SidebarItem } from "./sidebar-item"

import { AccountSettingsMenu } from "./account-settings-menu"

function getInitials(name: string | undefined | null, email: string | undefined | null): string {
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return 'U'
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const { user } = useAuth()
  const userInitials = getInitials(user?.name, user?.email)

  const baseUrl = currentOrganization && currentWorkspace
    ? `/${currentOrganization.id}/workspace/${currentWorkspace.id}`
    : ''

  const homeUrl = baseUrl || '/'
  const chatUrl = baseUrl ? `${baseUrl}/chats` : '/chats'
  const auditoriaUrl = baseUrl ? `${baseUrl}/auditoria` : '/auditoria'

  return (
    <>
      <Sidebar collapsible="icon" className="border-r relative z-50" {...props}>
        <SidebarContent className="flex flex-col gap-1 p-0 pt-4">
          <div className="flex pb-4 pt-2 px-3 items-center gap-2 overflow-hidden">
            <div className="h-10 w-8 shrink-0 overflow-hidden">
              <img src="/logo-removebg-preview.png" alt="RedLine" className="h-full w-auto max-w-none dark:brightness-100 brightness-0" />
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden transition-[width,opacity] duration-200 ease-linear w-auto opacity-100 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0"><span className="text-red-500">Red</span><span className="text-foreground">Line</span></span>
          </div>
          <SidebarItem
            icon={House}
            label="Home"
            isActive={pathname === homeUrl}
            onClick={() => router.push(homeUrl)}
          />
          <SidebarItem
            icon={ChatCircle}
            label="Chats"
            isActive={pathname.startsWith(chatUrl)}
            onClick={() => router.push(chatUrl)}
          />
          <SidebarItem
            icon={ShieldCheck}
            label="Auditoria"
            isActive={pathname.startsWith(auditoriaUrl)}
            onClick={() => router.push(auditoriaUrl)}
          />
        </SidebarContent>

        <SidebarFooter className="p-0 flex flex-col gap-0 pb-2">
          <SidebarItem
            icon={Bell}
            label="Notificações"
            isActive={false}
            onClick={() => {}}
          />
          <AccountSettingsMenu>
            <Button
              variant="ghost"
              className="group relative h-auto w-full rounded-none transition-colors hover:bg-transparent text-muted-foreground py-2 px-3 flex-row items-center justify-start gap-3 overflow-hidden"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-sidebar-accent">
                <Avatar className="h-7 w-7">
                  {user?.image && <AvatarImage src={user.image} alt="Account" />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm font-medium truncate whitespace-nowrap">{user?.name || user?.email || 'Conta'}</span>
            </Button>
          </AccountSettingsMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
