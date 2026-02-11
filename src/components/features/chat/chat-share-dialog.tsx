"use client"

import * as React from "react"
import { Globe, Lock, CaretDown, User, Check, Trash, Link as LinkIcon, Users } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

interface ChatMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'full_access' | 'can_edit' | 'can_comment' | 'can_view'
  isGuest?: boolean
}

const ROLES = {
  full_access: { label: 'Full access', description: 'Edit, suggest, comment, and share' },
  can_edit: { label: 'Can edit', description: 'Edit, suggest, and comment' },
  can_comment: { label: 'Can comment', description: 'Suggest and comment' },
  can_view: { label: 'Can view', description: 'Read only' },
}

export function ChatShareDialog({ children }: { children: React.ReactNode }) {
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [generalAccess, setGeneralAccess] = React.useState<'restricted' | 'workspace' | 'public'>('restricted')
  
  // TODO: Fetch members from API based on current user/chat
  const [members, setMembers] = React.useState<ChatMember[]>([])

  const handleInvite = () => {
    if (!inviteEmail) return
    toast.success(`Invite sent to ${inviteEmail}`)
    setInviteEmail("")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleRoleChange = (memberId: string, newRole: ChatMember['role']) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    toast.success("Role updated")
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId))
    toast.success("Member removed")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Share</h2>
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Email or group, separated by commas" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Invite
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {member.name} {member.role === 'owner' && "(You)"}
                      </span>
                      {member.isGuest && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200">
                          Guest
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </div>

                {member.role === 'owner' ? (
                  <span className="text-xs text-muted-foreground px-2">Full access</span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-normal text-muted-foreground">
                        {ROLES[member.role]?.label || member.role}
                        <CaretDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px]">
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">User access</DropdownMenuLabel>
                      
                      {Object.entries(ROLES).map(([roleKey, roleData]) => (
                        <DropdownMenuItem 
                          key={roleKey}
                          onClick={() => handleRoleChange(member.id, roleKey as ChatMember['role'])}
                          className="flex flex-col items-start py-2"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{roleData.label}</span>
                            {member.role === roleKey && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{roleData.description}</span>
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground">General access</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
                  {generalAccess === 'restricted' && <Lock className="h-4 w-4 text-muted-foreground" />}
                  {generalAccess === 'workspace' && <Users className="h-4 w-4 text-muted-foreground" />}
                  {generalAccess === 'public' && <Globe className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex flex-col">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent justify-start gap-1 font-medium">
                        {generalAccess === 'restricted' && "Only people invited"}
                        {generalAccess === 'workspace' && "Everyone at Organization"}
                        {generalAccess === 'public' && "Anyone on the web with link"}
                        <CaretDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[280px]">
                      <DropdownMenuItem onClick={() => setGeneralAccess('restricted')}>
                        <Lock className="h-4 w-4 mr-2" />
                        Only people invited
                        {generalAccess === 'restricted' && <Check className="h-3.5 w-3.5 ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setGeneralAccess('workspace')}>
                        <Users className="h-4 w-4 mr-2" />
                        Everyone at Organization
                        {generalAccess === 'workspace' && <Check className="h-3.5 w-3.5 ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setGeneralAccess('public')}>
                        <Globe className="h-4 w-4 mr-2" />
                        Anyone on the web with link
                        {generalAccess === 'public' && <Check className="h-3.5 w-3.5 ml-auto" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-xs text-muted-foreground">
                    {generalAccess === 'restricted' && "Only people invited can access"}
                    {generalAccess === 'workspace' && "Anyone in this workspace can access"}
                    {generalAccess === 'public' && "Anyone with the link can access"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-8 text-xs">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  Copy link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
