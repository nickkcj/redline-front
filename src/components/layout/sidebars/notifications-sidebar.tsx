import * as React from "react"
import { Funnel, DotsThree, Check, FileText } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase } from "./sidebar-base"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type NotificationType = 'invite' | 'access_request' | 'mention' | 'comment'

interface Notification {
  id: string
  user: {
    name: string
    avatar?: string
    initial: string
  }
  type: NotificationType
  action: string
  target: string
  targetType: 'document' | 'workspace' | 'project'
  date: string
  isUnread: boolean
}

const notifications: Notification[] = [
  {
    id: '1',
    user: { name: 'Lucas Ponce', initial: 'L' },
    type: 'access_request',
    action: 'requested access to',
    target: 'Prio <> Dooor',
    targetType: 'workspace',
    date: '10/22/2025',
    isUnread: false
  },
  {
    id: '2',
    user: { name: 'Sofia Lacerda', initial: 'S' },
    type: 'invite',
    action: 'invited you to',
    target: 'Estrutura "Value-first" da ...',
    targetType: 'document',
    date: '10/03/2025',
    isUnread: true
  },
  {
    id: '3',
    user: { name: 'Thiago Castroneves', initial: 'T' },
    type: 'invite',
    action: 'invited you to',
    target: 'Catalisando o ...',
    targetType: 'workspace',
    date: '09/30/2025',
    isUnread: false
  },
  {
    id: '4',
    user: { name: 'Sofia Lacerda', initial: 'S' },
    type: 'invite',
    action: 'invited you to',
    target: 'Estratégia Apresentação e ...',
    targetType: 'document',
    date: '09/30/2025',
    isUnread: true
  },
  {
    id: '5',
    user: { name: 'Sofia Lacerda', initial: 'S' },
    type: 'invite',
    action: 'invited you to',
    target: 'Storyboard',
    targetType: 'document',
    date: '09/24/2025',
    isUnread: false
  },
  {
    id: '6',
    user: { name: 'Sofia Lacerda', initial: 'S' },
    type: 'invite',
    action: 'invited you to',
    target: 'Oportunidades',
    targetType: 'document',
    date: '09/16/2025',
    isUnread: true
  },
  {
    id: '7',
    user: { name: 'Thiago Castroneves', initial: 'T' },
    type: 'invite',
    action: 'invited you to',
    target: 'Pilares Estratégico...',
    targetType: 'document',
    date: '09/12/2025',
    isUnread: true
  }
]

export function NotificationsSidebar() {
  return (
    <SidebarListBase
      title="Inbox"
      headerActions={
        <>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <Funnel className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <DotsThree className="h-4 w-4" />
          </Button>
        </>
      }
    >
        <div className="flex flex-col gap-0">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className="relative flex gap-3 px-3 py-4 hover:bg-sidebar-accent/50 cursor-pointer group border-b border-border/40 last:border-0 transition-colors"
            >
              <Avatar className="h-8 w-8 mt-0.5">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {notification.user.initial}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{notification.user.name}</span>
                  {' '}
                  {notification.action}
                  {' '}
                  <span className="font-medium text-foreground inline-flex items-center gap-1 align-bottom">
                     {notification.targetType === 'document' ? <FileText className="h-3 w-3" /> : null}
                     {notification.target}
                  </span>
                </div>
                
                {notification.id === '1' && (
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Approved by You on Oct 22, 2025, 7:44 PM
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground/60">{notification.date}</span>
                </div>
              </div>

              {notification.isUnread && (
                 <div className="absolute top-5 right-3 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
          ))}
        </div>
    </SidebarListBase>
  )
}
