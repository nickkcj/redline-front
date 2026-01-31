"use client"

import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavSecondaryItem {
  title: string
  icon?: LucideIcon
  onClick: () => void
  isActive?: boolean
}

interface NavSecondaryProps {
  items: NavSecondaryItem[]
}

export function NavSecondary({ items }: NavSecondaryProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              onClick={item.onClick}
              isActive={item.isActive}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
