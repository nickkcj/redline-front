/**
 * Access Control Section
 *
 * Tabbed interface combining Members and Roles management
 * Main entry point for RBAC administration UI
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { RolesManagementTable } from './roles-management-table'
import { MembersManagementTable } from './members-management-table'
import { Users, Shield } from 'lucide-react'

interface AccessControlSectionProps {
  workspaceId: string
}

/**
 * Access Control Section - Complete RBAC administration UI
 *
 * Provides tabbed interface for:
 * - Members: Manage workspace members and their role assignments
 * - Roles: Manage roles and permissions
 *
 * @example
 * <AccessControlSection workspaceId={workspaceId} />
 */
export function AccessControlSection({ workspaceId }: AccessControlSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Controle de Acesso</h2>
        <p className="text-muted-foreground">
          Gerencie membros, funções e permissões do workspace
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Membros</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Funções</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <MembersManagementTable workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RolesManagementTable workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
