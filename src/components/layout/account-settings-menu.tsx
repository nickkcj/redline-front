"use client"

import * as React from "react"
import {
  User,
  Gear,
  Palette,
  Robot,
  Keyboard,
  ListChecks,
  Bell,
  Plugs,
  Plug,
  Heart,
  ArrowCircleUp,
  MaskHappy,
  Check,
  Question,
  Moon,
  SignOut
} from "@phosphor-icons/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWorkspaceStore } from "@/store/workspace-store"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/providers/auth-provider"

interface AccountSettingsMenuProps {
  children: React.ReactNode
}

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

export function AccountSettingsMenu({ children }: AccountSettingsMenuProps) {
  const { setSettingsOpen } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()
  const { user, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePreferencesClick = () => {
    setSettingsOpen(true)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
  }

  const userInitials = getInitials(user?.name, user?.email)
  const userName = user?.name || user?.email || 'User'

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        className="w-64 p-1 rounded-xl shadow-lg border-border/50"
        sideOffset={10}
      >
        <div className="flex flex-col gap-0.5">
          {/* User Profile Header */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <Avatar className="h-9 w-9">
              {user?.avatar && <AvatarImage src={user.avatar} alt={userName} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{userName}</span>
              {user?.email && user?.name && (
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              )}
            </div>
          </div>

          <Separator className="my-1" />

          {/* Theme Toggle */}
          <div className="w-full flex items-center justify-between px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Moon weight="bold" className="h-4 w-4" />
              <span className="text-left">Dark Mode</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
            />
          </div>

          {/* Menu Items */}
          <MenuItem icon={Gear} label="Preferences" onClick={handlePreferencesClick} />
          <MenuItem icon={Robot} label="AI Assistant" />
          <MenuItem icon={Plugs} label="Connectors" />
          <MenuItem icon={Plug} label="API" />

          <Separator className="my-1" />

          <MenuItem icon={ArrowCircleUp} label="Upgrade plan" />

          <Separator className="my-1" />

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-2 h-8 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <SignOut className="h-4 w-4" />
            <span className="flex-1 text-left">Log out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MenuItemProps {
  icon: React.ElementType
  label: string
  hasDot?: boolean
  onClick?: () => void
}

function MenuItem({ icon: Icon, label, hasDot, onClick }: MenuItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {hasDot && (
        <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
      )}
    </Button>
  )
}
