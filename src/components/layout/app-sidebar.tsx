"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCommandPaletteContext } from "@/contexts/command-palette-context"
import { useAuthContext } from "@/contexts/auth-context"
import Image from "next/image"
import {
  House,
  Robot,
  Folders,
  Files,
  Link,
  Scroll,
  ChatCircle,
  MagnifyingGlass,
  User as UserIcon,
  Gear,
  SignOut,
  Moon,
  Sun,
  List
} from "@phosphor-icons/react"
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
  { name: "Dashboard", href: "/dashboard", icon: House },
  { name: "AI Chat", href: "/ai-chat", icon: Robot },
  { name: "Data Rooms", href: "/rooms", icon: Folders },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Share Links", href: "/accesses", icon: Link },
  { name: "Audit Logs", href: "/audit", icon: Scroll },
]

const actions = [
  { name: "Chat", action: "openChat", icon: ChatCircle },
  { name: "Command Palette", action: "openCommand", icon: MagnifyingGlass },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { openPalette } = useCommandPaletteContext()
  const { logout } = useAuthContext()
  const [isHoveringHeader, setIsHoveringHeader] = useState(false)

  const handleNavigation = (href: string) => {
    if (pathname !== href) router.push(href)
  }

  const handleAction = (action: string) => {
    if (action === "openChat") {
      window.dispatchEvent(new CustomEvent("open-chat"))
    } else if (action === "openCommand") {
      openPalette()
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout API fails, redirect to login
      router.push('/login')
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="group transition-[width] duration-200 ease-out"
    >
      <SidebarHeader
        className="h-[72px] relative border-b"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <div className="flex items-center justify-between px-3 h-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className={cn(
            "flex items-center gap-3 transition-opacity duration-200",
            isHoveringHeader && "group-data-[collapsible=icon]:opacity-0"
          )}>
            <div className="h-8 w-8 shrink-0 flex items-center justify-center">
              <Image
                src={theme === "dark" ? "/seloDooorWhite.png" : "/seloDooorBlack.png"}
                alt="Logo"
                width={32}
                height={32}
                className="object-contain group-data-[collapsible=icon]:w-4 group-data-[collapsible=icon]:h-4"
              />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap group-data-[collapsible=icon]:sr-only">
              App Name
            </span>
          </div>

          <SidebarTrigger
            className="h-8 w-8 rounded-md hover:bg-accent/40 group-data-[collapsible=icon]:hidden flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <List className="h-4 w-4" />
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
              <List className="h-4 w-4" />
            </div>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup className="pt-4 pb-2">
          <div className="h-9 flex items-center mb-1">
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

        <SidebarGroup className="pt-2 pb-2">
          <div className="h-9 flex items-center mb-1">
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
                    <UserIcon className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Gear className="mr-2 h-4 w-4" />
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
                <DropdownMenuItem onClick={handleLogout}>
                  <SignOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Removed SidebarRail to prevent double border */}
    </Sidebar>
  )
}