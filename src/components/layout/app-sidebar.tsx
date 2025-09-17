"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Moon,
  Sun,
  LogOut,
  User,
  FileText,
  Settings,
  FolderOpen,
  ScrollText,
  Link2,
  Menu,
  Home,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Data Rooms", href: "/rooms", icon: FolderOpen },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Share Links", href: "/accesses", icon: Link2 },
  { name: "Audit Logs", href: "/audit", icon: ScrollText },
]

const actions = [
  { name: "Chat", action: "openChat", icon: MessageCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isHoveringHeader, setIsHoveringHeader] = useState(false)

  const handleNavigation = (href: string) => {
    if (pathname !== href) router.push(href)
  }

  const handleAction = (action: string) => {
    if (action === "openChat") {
      window.dispatchEvent(new CustomEvent("open-chat"))
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="group border-r transition-[width] duration-200 ease-out"
    >
      <SidebarHeader
        className="h-[60px] relative"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <div className="flex items-center justify-between px-3 h-full">
          <div className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            isHoveringHeader && "group-data-[collapsible=icon]:opacity-0"
          )}>
            <div className="h-7 w-7 shrink-0 -ml-2 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
              App Name
            </span>
          </div>

          <SidebarTrigger
            className="h-8 w-8 rounded-md hover:bg-accent/40 group-data-[collapsible=icon]:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </SidebarTrigger>

          <button
            onClick={(e) => {
              e.preventDefault()
              const trigger = document.querySelector('[aria-label="Toggle sidebar"]') as HTMLButtonElement
              trigger?.click()
            }}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "group-data-[collapsible=icon]:flex hidden",
              "transition-opacity duration-200",
              isHoveringHeader ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="h-8 w-8 rounded-md hover:bg-accent/40 flex items-center justify-center">
              <Menu className="h-4 w-4" />
            </div>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup className="py-0">
          <div className="h-9 flex items-center ">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Navegação
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.href)}
                    isActive={pathname === item.href}
                    tooltip={item.name}
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.name}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <div className="h-9 flex items-center">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Ações
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {actions.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => handleAction(item.action)}
                    tooltip={item.name}
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.name}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground font-medium text-sm">U</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">Usuário</span>
                    <span className="truncate text-xs">user@example.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">U</span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Usuário</span>
                      <span className="truncate text-xs">user@example.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === "light" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}