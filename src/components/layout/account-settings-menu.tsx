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
  Moon
} from "@phosphor-icons/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useWorkspaceStore } from "@/store/workspace-store"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

interface AccountSettingsMenuProps {
  children: React.ReactNode
}

export function AccountSettingsMenu({ children }: AccountSettingsMenuProps) {
  const { setSettingsOpen } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePreferencesClick = () => {
    setSettingsOpen(true)
    setIsOpen(false)
  }

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
          {/* Header - Theme */}
          <div className="w-full flex items-center justify-between px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer mb-1 transition-colors">
            <div className="flex items-center gap-3">
              <User weight="bold" className="h-4 w-4" />
              <span className="text-left">Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon weight="bold" className="h-3.5 w-3.5 text-muted-foreground" />
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
              />
            </div>
          </div>

          {/* Menu Items */}
          <MenuItem icon={Gear} label="Preferences" onClick={handlePreferencesClick} />
          <MenuItem icon={Robot} label="Assistant" />
          <MenuItem icon={Plugs} label="Connectors" />
          <MenuItem icon={Plug} label="API" />

          <Separator className="my-1" />

          <MenuItem icon={ArrowCircleUp} label="Upgrade plan" />

          <Separator className="my-1" />

          {/* User Profile */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarFallback className="text-[10px] rounded-sm bg-purple-600 text-white">DA</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Dooor.ai</span>
            </div>
            <Check weight="bold" className="h-4 w-4 text-primary" />
          </div>

          <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarFallback className="text-[10px] rounded-sm bg-blue-600 text-white">MP</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Multiplan</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-sm">
                <AvatarFallback className="text-[10px] rounded-sm bg-orange-600 text-white">CS</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Castro</span>
            </div>
          </div>

          {/* Incognito */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer group">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 flex items-center justify-center rounded-full bg-foreground text-background">
                <MaskHappy weight="bold" className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium">Incognito</span>
            </div>
            <Question weight="bold" className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
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
