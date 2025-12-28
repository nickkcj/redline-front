"use client"

import * as React from "react"
import { Users, Shield, FileText, Settings as SettingsIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BreadcrumbHeader } from "@/components/layout/breadcrumb-header"
import { MembersTab } from "@/components/features/admin/members-tab"
import { RBACTab } from "@/components/features/admin/rbac-tab"
import { AuditLogsTab } from "@/components/features/admin/audit-logs-tab"
import { SettingsTab } from "@/components/features/admin/settings-tab"
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
    { label: currentOrganization?.name || 'Organization', href: '/org' },
    { label: currentWorkspace?.name || 'Workspace' },
    { label: 'Administração' },
  ]

  return (
    <div className="h-screen flex flex-col">
      <BreadcrumbHeader breadcrumbs={breadcrumbs} />

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
            <p className="text-muted-foreground">
              Gerencie membros, permissões, configurações e monitore atividades do workspace.
            </p>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Membros</span>
              </TabsTrigger>
              <TabsTrigger value="rbac" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">RBAC</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Audit Logs</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <MembersTab workspaceId={resolvedParams.workspaceId} />
            </TabsContent>

            <TabsContent value="rbac" className="space-y-4">
              <RBACTab workspaceId={resolvedParams.workspaceId} />
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <AuditLogsTab workspaceId={resolvedParams.workspaceId} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab workspaceId={resolvedParams.workspaceId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
