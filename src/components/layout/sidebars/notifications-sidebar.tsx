import * as React from "react"
import { Funnel, DotsThree, Bell, FileText } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarListBase } from "./sidebar-base"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

export function NotificationsSidebar() {
  // TODO: Fetch notifications from API
  const notifications: Notification[] = []

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
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No notifications</p>
          <p className="text-xs text-muted-foreground/70">You're all caught up</p>
        </div>
      ) : (
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

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground/60">{notification.date}</span>
                </div>
              </div>

              {notification.isUnread && (
                <div className="absolute top-5 right-3 h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </SidebarListBase>
  )
}
