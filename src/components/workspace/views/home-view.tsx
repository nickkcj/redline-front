'use client'

import * as React from 'react'
import { Clock, FileText, CaretRight, CaretLeft, ChatCircle, Graph, Cube } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useWorkspaceStore } from '@/store/workspace-store'

export function HomeView() {
  const { addTabInNewWindow } = useWorkspaceStore()
  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  if (currentHour >= 12) greeting = 'Good afternoon'
  if (currentHour >= 18) greeting = 'Good evening'

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(true)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      // Check initial state
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const recentSpaces = [
    { id: 1, title: 'Castro', lastEdited: 'Dec 30, 2025', isPrivate: true, cover: '/bglogin.png' },
    { id: 2, title: 'Julianaimage.png', lastEdited: '2w ago', isPrivate: true, cover: '/8392.jpg' },
    { id: 3, title: 'Davinci', lastEdited: 'Aug 12, 2025', isPrivate: true, cover: '/31279.jpg' },
    { id: 4, title: 'Log ( MOV )', lastEdited: '2w ago', isPrivate: true, cover: '/2151794749.jpg' },
    { id: 5, title: 'Iphone Space Transform', lastEdited: 'Feb 1, 2025', isPrivate: false, members: ['/image 36.png', '/image 161.png'], cover: '/2151961986.jpg' },
    { id: 6, title: 'aaaa', lastEdited: 'Jan 21', isPrivate: true, cover: '/sunrise-bali-jungle.jpg' },
    { id: 7, title: 'Project Beta', lastEdited: '3d ago', isPrivate: false, members: ['/image 36.png', '/image 162.png', '/image 163.png'], cover: '/8392.jpg' },
    { id: 8, title: 'Marketing Q1', lastEdited: '1w ago', isPrivate: false, members: ['/image 158.png', '/image 36.png'], cover: '/31279.jpg' },
    { id: 9, title: 'Design System', lastEdited: '2d ago', isPrivate: true, cover: '/2151794749.jpg' },
    { id: 10, title: 'Finance', lastEdited: '1mo ago', isPrivate: true, cover: '/2151961986.jpg' },
    { id: 11, title: 'HR Policies', lastEdited: '3w ago', isPrivate: false, members: ['/image 36.png'], cover: '/sunrise-bali-jungle.jpg' },
    { id: 12, title: 'Engineering', lastEdited: '5d ago', isPrivate: false, members: ['/image 161.png', '/image 162.png'], cover: '/bglogin.png' },
  ]

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      'Engenharia': 'bg-slate-100 text-slate-700',
      'Produto': 'bg-blue-100 text-blue-700',
      'Design': 'bg-pink-100 text-pink-700',
      'Marketing': 'bg-orange-100 text-orange-700',
      'RH': 'bg-purple-100 text-purple-700',
      'Geral': 'bg-gray-100 text-gray-700',
      'Suporte': 'bg-green-100 text-green-700',
      'Jurídico': 'bg-red-100 text-red-700',
      'DevOps': 'bg-yellow-100 text-yellow-700',
      'Financeiro': 'bg-emerald-100 text-emerald-700'
    }
    return colors[group] || 'bg-muted text-muted-foreground'
  }

  const myAgents = [
    { 
      id: 1, 
      name: 'Email Summarizer Bot', 
      status: 'active', 
      statusLabel: 'Ativo',
      lastActive: 'Rodando há 42h',
      action: 'Summarizing weekly report...',
      notifications: 2,
      logs: ['10:00 - Processed 15 emails', '09:00 - Started daily scan', '08:00 - System check OK'] 
    },
    { 
      id: 2, 
      name: 'News Digest Daily', 
      status: 'paused', 
      statusLabel: 'Pausado',
      lastActive: 'Parado há 12 min',
      action: 'Waiting for next schedule',
      notifications: 0,
      logs: ['Yesterday - Paused by user', '2 days ago - Sent daily digest'] 
    },
    { 
      id: 3, 
      name: 'Legacy Code Review', 
      status: 'error', 
      statusLabel: 'Erro',
      lastActive: 'Erro há 2 min',
      action: 'Connection timeout',
      notifications: 1,
      logs: ['08:30 - Connection timeout', '08:29 - Retrying connection...', '08:28 - Failed to fetch repo'] 
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500'
      case 'paused': return 'text-yellow-500 bg-yellow-500'
      case 'error': return 'text-red-500 bg-red-500'
      default: return 'text-muted-foreground bg-muted-foreground'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'paused': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground">Here's what's happening in your workspace.</p>
      </div>

      {/* Recent Spaces */}
      <div className="space-y-4 group/section relative">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cube className="h-4 w-4" />
            <span>Recent Spaces</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
            View all
          </Button>
        </div>
        
        <div className="relative -mx-4 px-4">
            <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {recentSpaces.map((space, i) => (
                    <div 
                        key={i} 
                        className="snap-start shrink-0 w-[160px] h-[140px] rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:bg-accent/50 transition-all cursor-pointer flex flex-col group relative"
                    >
                        {/* Cover Image Area */}
                        <div className="h-[35%] w-full bg-muted relative overflow-hidden">
                            {space.cover ? (
                                <img src={space.cover} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className={`w-full h-full opacity-30 ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][i % 5]}`} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-3 flex flex-col flex-1">
                            <div className="mb-2">
                                <h3 className="font-medium text-sm truncate leading-tight">{space.title}</h3>
                            </div>
                            
                            <div className="mt-auto flex items-end justify-between">
                                <p className="text-[10px] text-muted-foreground">{space.lastEdited}</p>
                                
                                <div className="flex items-center">
                                    {space.isPrivate ? (
                                        <Avatar className="h-5 w-5 border border-background">
                                            <AvatarImage src="/image 36.png" />
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="flex -space-x-1.5">
                                            {space.members?.slice(0, 3).map((member, idx) => (
                                                <Avatar key={idx} className="h-5 w-5 border border-background">
                                                    <AvatarImage src={member} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fade Effect */}
            <div className={cn(
              "absolute right-0 top-0 bottom-4 w-32 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none transition-opacity duration-300",
              showRightArrow ? "opacity-100" : "opacity-0"
            )} />

             {/* Left Fade Effect - only when scrolled */}
             <div className={cn(
              "absolute left-0 top-0 bottom-4 w-32 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none transition-opacity duration-300",
              showLeftArrow ? "opacity-100" : "opacity-0"
            )} />

            {/* Scroll Buttons */}
            {showLeftArrow && (
              <button 
                  onClick={scrollLeft}
                  className="absolute -left-3 top-[40%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/section:opacity-100 transition-opacity"
              >
                  <CaretLeft className="h-4 w-4" />
              </button>
            )}

            {showRightArrow && (
              <button 
                  onClick={scrollRight}
                  className="absolute -right-3 top-[40%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover/section:opacity-100 transition-opacity"
              >
                  <CaretRight className="h-4 w-4" />
              </button>
            )}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChatCircle className="h-4 w-4" />
            <span>Recent Chats</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
            View all
          </Button>
        </div>
        <Card className="border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0">
             <ScrollArea className="h-[520px]">
               <div className="divide-y">
                 {[
                    { id: 101, title: 'Debug API Pagamentos', group: 'Engenharia', isPrivate: false, members: ['/image 161.png', '/image 162.png'], time: '2 min ago', unread: 3 },
                    { id: 102, title: 'Planejamento Q3', group: 'Produto', isPrivate: false, members: ['/image 36.png', '/image 158.png', '/image 163.png'], time: '1h ago', unread: 0 },
                    { id: 103, title: 'Feedback Design', group: 'Design', isPrivate: true, members: ['/image 36.png'], time: '3h ago', unread: 1 },
                    { id: 104, title: 'Campanha Black Friday', group: 'Marketing', isPrivate: false, members: ['/image 158.png', '/image 161.png'], time: '5h ago', unread: 0 },
                    { id: 105, title: 'Onboarding Novo Dev', group: 'RH', isPrivate: true, members: ['/image 162.png'], time: '1d ago', unread: 0 },
                    { id: 106, title: 'Reunião Semanal', group: 'Geral', isPrivate: false, members: ['/image 161.png', '/image 162.png', '/image 36.png'], time: '1d ago', unread: 5 },
                    { id: 107, title: 'Ideias App Mobile', group: 'Produto', isPrivate: false, members: ['/image 36.png', '/image 158.png'], time: '2d ago', unread: 0 },
                    { id: 108, title: 'Suporte Cliente #1234', group: 'Suporte', isPrivate: false, members: ['/image 163.png'], time: '2d ago', unread: 2 },
                    { id: 109, title: 'Revisão de Contratos', group: 'Jurídico', isPrivate: true, members: ['/image 36.png'], time: '3d ago', unread: 0 },
                    { id: 110, title: 'Integração Slack', group: 'DevOps', isPrivate: false, members: ['/image 161.png', '/image 162.png'], time: '3d ago', unread: 0 },
                    { id: 111, title: 'Brainstorming UI', group: 'Design', isPrivate: false, members: ['/image 36.png', '/image 158.png', '/image 163.png'], time: '4d ago', unread: 0 },
                    { id: 112, title: 'Orçamento 2026', group: 'Financeiro', isPrivate: true, members: ['/image 36.png'], time: '1w ago', unread: 0 }
                 ].map((chat, i) => (
                   <div 
                     key={i} 
                     className="flex items-center gap-4 px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer group"
                     onClick={() => addTabInNewWindow('chat', chat.title, { chatId: chat.id })}
                   >
                     <div className="relative flex items-center justify-center w-8 h-8 bg-background rounded-md border shrink-0">
                       <ChatCircle className="h-4 w-4 text-muted-foreground" />
                       {chat.unread > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full ring-2 ring-background">
                            {chat.unread}
                          </div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0 flex items-center gap-3">
                       <h4 className="font-medium text-sm truncate">{chat.title}</h4>
                       <div className="flex items-center gap-2">
                         <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getGroupColor(chat.group))}>
                           {chat.group}
                         </span>
                         {chat.isPrivate && (
                           <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                             Private
                           </span>
                         )}
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                        
                        {/* Members Avatars */}
                        <div className="flex -space-x-2 shrink-0">
                            {chat.members.map((member, idx) => (
                                <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={member} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                     </div>

                     <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-7 text-xs">Open</Button>
                   </div>
                 ))}
               </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Meus Agents */}
      <div className="space-y-4 pb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
             <Graph className="h-4 w-4" />
             <span>Meus Agents</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
            View all
          </Button>
        </div>
         <Card className="border-0 bg-muted/30 shadow-none">
          <CardContent className="p-0">
             <div className="divide-y">
               {myAgents.map((agent) => (
                 <TooltipProvider key={agent.id}>
                   <Tooltip delayDuration={0}>
                     <TooltipTrigger asChild>
                       <div className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-3">
                           <div className="relative flex items-center justify-center w-8 h-8 bg-background rounded-md border shrink-0">
                             <Graph className="h-4 w-4 text-muted-foreground" />
                             {agent.notifications > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full ring-2 ring-background">
                                  {agent.notifications}
                                </div>
                             )}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-medium">{agent.name}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {agent.status === 'active' && <span className="relative flex h-1.5 w-1.5 mr-0.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span></span>}
                                {agent.action}
                              </span>
                           </div>
                         </div>
                         <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-2">
                                <div className={cn("h-1.5 w-1.5 rounded-full", getStatusColor(agent.status).split(' ')[1])} />
                                <span className={cn("text-xs font-medium", getStatusTextColor(agent.status))}>
                                  {agent.statusLabel}
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{agent.lastActive}</span>
                         </div>
                       </div>
                     </TooltipTrigger>
                     <TooltipContent side="top" className="bg-popover text-popover-foreground border shadow-lg p-3 w-64">
                       <div className="space-y-2">
                         <div className="flex items-center justify-between border-b pb-2">
                           <span className="font-semibold text-xs">Atividade Recente</span>
                           <div className={cn("h-2 w-2 rounded-full", getStatusColor(agent.status).split(' ')[1])} />
                         </div>
                         <div className="space-y-1">
                           {agent.logs.map((log, idx) => (
                             <p key={idx} className="text-[10px] text-muted-foreground font-mono">
                               {log}
                             </p>
                           ))}
                         </div>
                       </div>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
