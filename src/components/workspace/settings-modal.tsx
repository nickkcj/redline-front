'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  X,
  User,
  Bell,
  Globe,
  Monitor,
  Settings,
  Users,
  Shield,
  CreditCard,
  Upload,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWorkspaceStore } from '@/store/workspace-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, workspaces, activeWorkspaceId } = useWorkspaceStore()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = React.useState('appearance')

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-[900px] h-[600px] p-0 gap-0 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-muted/30 border-r flex flex-col p-2">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mb-1">
            Account
          </div>
          <div className="space-y-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-3"
              onClick={() => setActiveTab('my-account')}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">NC</AvatarFallback>
              </Avatar>
              <span className="truncate">My account</span>
            </Button>
            <Button
              variant={activeTab === 'appearance' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start gap-2 px-3"
              onClick={() => setActiveTab('appearance')}
            >
              <Monitor className="h-4 w-4" />
              Settings & Members
            </Button>
            {/* Using appearance as the generic "My settings" for this demo, 
                actually Notion has "My settings" which includes Appearance. 
                I'll name it "Appearance" specifically for the task. */}
          </div>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground mt-4 mb-1">
            Workspace
          </div>
          <div className="space-y-0.5">
            <Button
              variant={activeTab === 'general' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start gap-2 px-3"
              onClick={() => setActiveTab('general')}
            >
              <Settings className="h-4 w-4" />
              General
            </Button>
            <Button
              variant={activeTab === 'members' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start gap-2 px-3"
              onClick={() => setActiveTab('members')}
            >
              <Users className="h-4 w-4" />
              Members
            </Button>
            <Button
              variant={activeTab === 'upgrade' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start gap-2 px-3 hover:bg-muted"
              onClick={() => setActiveTab('upgrade')}
            >
              <CreditCard className="h-4 w-4" />
              Upgrade plan
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-full flex flex-col">
            <DialogHeader className="px-8 py-6 border-b">
              <DialogTitle className="text-lg font-medium">
                {activeTab === 'appearance' && 'My settings'}
                {activeTab === 'general' && 'Workspace settings'}
                {activeTab === 'members' && 'Members'}
                {activeTab === 'my-account' && 'My account'}
                {activeTab === 'upgrade' && 'Upgrade plan'}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-8">
                {activeTab === 'appearance' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase">Appearance</h3>
                      <div className="grid gap-2">
                        <Label className="text-base font-normal">Customize how Notion looks on your device.</Label>
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase">Language & Region</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-normal">Language</Label>
                            <p className="text-sm text-muted-foreground">Change the language used in the user interface.</p>
                          </div>
                          <Select defaultValue="en">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English (US)</SelectItem>
                              <SelectItem value="pt">Portuguese (Brasil)</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Placeholders for other tabs */}
                {activeTab !== 'appearance' && (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Settings for {activeTab} would go here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
