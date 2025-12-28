"use client"

import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRoles } from "@/hooks/api/use-roles"
import { useAllPermissions } from "@/hooks/api/use-permissions"
import { RolesManagementTable } from "@/components/features/permissions/roles-management-table"

interface RBACTabProps {
  workspaceId: string
}

export function RBACTab({ workspaceId }: RBACTabProps) {
  const { data: roles = [], isLoading: loadingRoles } = useRoles(workspaceId)
  const { data: permissions = [], isLoading: loadingPermissions } = useAllPermissions(workspaceId)

  const isLoading = loadingRoles || loadingPermissions

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roles e Permissões</h2>
          <p className="text-muted-foreground">
            Configure as funções e permissões do workspace
          </p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Criar Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <RolesManagementTable
          roles={roles}
          permissions={permissions}
          workspaceId={workspaceId}
        />
      )}
    </div>
  )
}
