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
  Question
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

interface AccountSettingsMenuProps {
  children: React.ReactNode
}

export function AccountSettingsMenu({ children }: AccountSettingsMenuProps) {
  const { setSettingsOpen } = useWorkspaceStore()
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
          {/* Header */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50 mb-1">
            <User weight="bold" className="h-4 w-4" />
            <span className="text-sm font-medium">Account</span>
          </div>

          {/* Menu Items */}
          <MenuItem icon={Gear} label="Preferences" onClick={handlePreferencesClick} />
          <MenuItem icon={Palette} label="Personalization" />
          <MenuItem icon={Robot} label="Assistant" />
          <MenuItem icon={Keyboard} label="Shortcuts" />
          <MenuItem icon={ListChecks} label="Tasks" hasDot />
          <MenuItem icon={Bell} label="Notifications" />
          <MenuItem icon={Plugs} label="Connectors" />
          <MenuItem icon={Plug} label="API" />
          <MenuItem icon={Heart} label="Pro Perks" />
          <MenuItem icon={Gear} label="All settings" onClick={handlePreferencesClick} />

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
