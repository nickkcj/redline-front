"use client"

import * as React from "react"
import { Users, History, Settings, CreditCard, Mail } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { MembersTab } from "@/components/features/admin/members-tab"
import { RBACTab } from "@/components/features/admin/rbac-tab"
import { AuditLogsTab } from "@/components/features/admin/audit-logs-tab"
import { InvitesTab } from "@/components/features/admin/invites-tab"
import { useCurrentOrganization, useCurrentWorkspace } from "@/lib/stores/app.store"

interface AdminPageProps {
  params: Promise<{
    orgId: string
    workspaceId: string
  }>
}

export default function AdminPage({ params }: AdminPageProps) {
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const [resolvedParams, setResolvedParams] = React.useState<{
    orgId: string
    workspaceId: string
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

  // Dynamic breadcrumbs
  const breadcrumbs = [
    { label: currentOrganization?.name || 'Organization', href: '/' },
    { label: currentWorkspace?.name || 'Workspace' },
    { label: 'Administração' },
  ]

  return (
    <div className="h-screen flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-6xl mx-auto py-6 pl-8 pr-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Administração
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie configurações, uso de recursos e membros do projeto
            </p>
          </div>

          <Tabs defaultValue="access" className="space-y-6">
            <TabsList className="w-full justify-start bg-muted/50 p-1">
              <TabsTrigger value="audit" className="flex-1 max-w-[200px] gap-2">
                <History className="h-4 w-4" />
                Auditoria
              </TabsTrigger>
              <TabsTrigger value="access" className="flex-1 max-w-[200px] gap-2">
                <Users className="h-4 w-4" />
                Controle de Acesso
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className="space-y-4">
              <AuditLogsTab workspaceId={resolvedParams.workspaceId} />
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              <Tabs defaultValue="members">
                <TabsList className="w-auto">
                  <TabsTrigger value="members">Membros</TabsTrigger>
                  <TabsTrigger value="invites">Convites</TabsTrigger>
                  <TabsTrigger value="roles">Funções</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-6">
                  <MembersTab workspaceId={resolvedParams.workspaceId} />
                </TabsContent>

                <TabsContent value="invites" className="mt-6">
                  <InvitesTab workspaceId={resolvedParams.workspaceId} />
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                  <RBACTab workspaceId={resolvedParams.workspaceId} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
