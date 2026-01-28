"use client"

import * as React from "react"
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { ChatsView } from "@/components/workspace/views/chats-view"
import { StatusBar } from "@/components/workspace/status-bar"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"

interface ChatsPageProps {
  params: Promise<{
    orgId: string
    workspaceId: string
  }>
}

export default function ChatsPage({ params }: ChatsPageProps) {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const [resolvedParams, setResolvedParams] = React.useState<{
    orgId: string
    workspaceId: string
  } | null>(null)
  const [zoom, setZoom] = React.useState(100)

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

  // Dynamic breadcrumbs
  const breadcrumbs = [
    { label: currentOrganization?.name || 'Organization', href: '/' },
    { label: currentWorkspace?.name || 'Workspace' },
    { label: 'Chats' },
  ]

  return (
    <div className="h-full flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />
      <div className="flex-1 min-h-0" style={{ zoom: zoom / 100 }}>
        <ChatsView />
      </div>
      <StatusBar 
        breadcrumbs={[{ id: 'chats', label: 'Chats' }]}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </div>
  )
}
