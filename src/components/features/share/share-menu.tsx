'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Buildings, CaretDown, Globe, Link as LinkIcon, Star, DotsThree, Trash, Copy, ArrowRight, Export, Plus, PencilSimple } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useWorkspaceStore } from '@/store/workspace-store'

const users = [
  { name: 'Lucas Ponce', time: '3 months ago', initial: 'L', color: 'bg-zinc-600', image: '/image 158.png' },
  { name: 'Peter Flag', time: '7 months ago', initial: 'P', color: 'bg-emerald-600', image: '/image 161.png' },
  { name: 'Eduardo Boçon', time: '8 months ago', initial: 'E', color: 'bg-blue-600', image: '/image 162.png' },
]

export function ShareMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { tabs, activeTabId } = useWorkspaceStore()
  
  const activeTab = tabs.find(t => t.id === activeTabId)
  const documentTitle = activeTab?.title || "Untitled"

  return (
    <div className="flex items-center gap-1 pr-2">
      {/* Avatar Stack */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center -space-x-2 cursor-pointer hover:opacity-80 transition-opacity mr-3">
             <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src="/image 158.png" />
                <AvatarFallback className="bg-zinc-600 text-white text-[9px]">LP</AvatarFallback>
             </Avatar>
             <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src="/image 161.png" />
                <AvatarFallback className="bg-emerald-600 text-white text-[9px]">PF</AvatarFallback>
             </Avatar>
             <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src="/image 162.png" />
                <AvatarFallback className="bg-blue-600 text-white text-[9px]">EB</AvatarFallback>
             </Avatar>
             <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
               +12
             </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
           <div className="p-3">
             <h4 className="text-[10px] font-semibold text-muted-foreground mb-3 tracking-wider">LAST VIEWED BY</h4>
             <div className="space-y-3">
               {users.map((user, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Avatar className="h-5 w-5">
                          {user.image && <AvatarImage src={user.image} />}
                          <AvatarFallback className={`${user.color} text-white text-[9px]`}>{user.initial}</AvatarFallback>
                       </Avatar>
                       <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{user.time}</span>
                 </div>
               ))}
               <div className="text-xs text-muted-foreground pt-1 pl-7">9 more...</div>
             </div>
           </div>
        </PopoverContent>
      </Popover>

      {/* Share Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 font-normal text-muted-foreground hover:text-foreground px-2">
             <Buildings className="h-4 w-4" />
             Share
             <CaretDown className="h-3 w-3 opacity-50 rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 gap-0 overflow-hidden" align="end" sideOffset={5}>
           <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between mb-5">
                 <div className="flex gap-6 border-b border-transparent">
                    <button className="text-sm font-medium border-b-2 border-foreground pb-1 text-foreground">Share</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1 transition-colors">Publish</button>
                 </div>
              </div>
              
              <div className="flex gap-0 mb-6">
                 <Input 
                    placeholder="Email or group, separated by commas" 
                    className="flex-1 rounded-r-none border-r-0 bg-muted/50 border-border focus-visible:ring-0 focus-visible:border-border placeholder:text-muted-foreground" 
                 />
                 <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700 text-white border border-blue-600">Invite</Button>
              </div>
              
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src="/image 163.png" />
                          <AvatarFallback className="bg-muted text-foreground">C</AvatarFallback>
                       </Avatar>
                       <div>
                          <p className="text-sm font-medium text-foreground">Castro (You)</p>
                          <p className="text-xs text-muted-foreground">castro@dooor.ai</p>
                       </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Can edit</span>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-blue-500 border border-border">
                          <Globe className="h-5 w-5" weight="fill" />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-foreground">People in Dooor Foundation HQ</p>
                          <p className="text-xs text-muted-foreground">Teamspace • 9 people</p>
                       </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Mixed access</span>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <Globe className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-sm font-medium text-foreground">Everyone at Dooor Foundation</p>
                          <p className="text-xs text-muted-foreground">General access</p>
                       </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Can edit</span>
                 </div>
              </div>
           </div>
           
           <div className="p-3 bg-muted/50 flex items-center justify-between border-t border-border">
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                 <div className="h-4 w-4 rounded-full border border-muted-foreground/50 flex items-center justify-center">?</div>
                 Learn about sharing
              </button>
              <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground">
                 <LinkIcon className="h-4 w-4" />
                 Copy link
              </Button>
           </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
