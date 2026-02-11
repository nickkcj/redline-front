"use client"

import * as React from "react"
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { ChatView } from "@/components/workspace/views/chat-view"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"

interface ChatPageProps {
  params: Promise<{
    orgId: string
    workspaceId: string
    chatId: string
  }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const [resolvedParams, setResolvedParams] = React.useState<{
    orgId: string
    workspaceId: string
    chatId: string
  } | null>(null)

  React.useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const baseUrl = `/${resolvedParams.orgId}/workspace/${resolvedParams.workspaceId}`

  const breadcrumbs = [
    { label: currentOrganization?.name || 'Organization', href: '/' },
    { label: currentWorkspace?.name || 'Workspace', href: baseUrl },
    { label: 'Chats', href: `${baseUrl}/chats` },
    { label: 'Conversa' },
  ]

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />
      <div className="flex-1 min-h-0">
        <ChatView tabId={resolvedParams.chatId} tabData={{ chatId: resolvedParams.chatId }} />
      </div>
    </div>
  )
}
