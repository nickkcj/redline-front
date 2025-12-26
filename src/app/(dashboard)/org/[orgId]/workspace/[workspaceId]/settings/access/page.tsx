/**
 * Workspace Access Settings Page
 *
 * Protected page for managing workspace access control (RBAC)
 * Requires workspace.admin permission
 */

'use client'

import { ProtectedRoute } from '@/components/permissions/protected-route'
import { AccessControlSection } from '@/components/permissions/access-control-section'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WorkspaceAccessSettingsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const orgId = params.orgId as string

  return (
    <ProtectedRoute
      requiredPermissions={['workspace.admin', 'member.read.all', 'role.read.all']}
    >
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/org/${orgId}/workspace/${workspaceId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Configurações de Acesso
              </h1>
              <p className="text-muted-foreground">
                Gerencie membros, funções e permissões do workspace
              </p>
            </div>
          </div>

          {/* Access Control Section */}
          <AccessControlSection workspaceId={workspaceId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
