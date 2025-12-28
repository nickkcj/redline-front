"use client"

import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMembers } from "@/hooks/api/use-members"
import { useRoles } from "@/hooks/api/use-roles"
import { MembersManagementTable } from "@/components/features/permissions/members-management-table"

interface MembersTabProps {
  workspaceId: string
}

export function MembersTab({ workspaceId }: MembersTabProps) {
  const { data: members = [], isLoading: loadingMembers } = useMembers(workspaceId)
  const { data: roles = [], isLoading: loadingRoles } = useRoles(workspaceId)

  const isLoading = loadingMembers || loadingRoles

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Membros do Workspace</h2>
          <p className="text-muted-foreground">
            Gerencie os membros e suas permissões
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Membro
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <MembersManagementTable
          members={members}
          roles={roles}
          workspaceId={workspaceId}
        />
      )}
    </div>
  )
}
