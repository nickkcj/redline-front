"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCurrentOrganization, useSetCurrentWorkspace } from "@/lib/stores/app.store"
import {
  useOrganizations,
  useCreateWorkspaceInOrganization,
  useUpdateWorkspaceInOrganization,
  useDeleteWorkspaceInOrganization,
  useLeaveWorkspace,
  useOrganizationPermissions
} from "@/hooks/api/use-organization"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { OrganizationWithWorkspaces, WorkspaceSummary } from "@/lib/api/types/organization.types"
import {
  WorkspaceCard,
  WorkspacesHeader,
  WorkspaceCreateModal,
  WorkspaceEditModal,
  WorkspaceDeleteModal,
  WorkspaceLeaveModal,
} from "@/components/features/workspace"

export function WorkspaceList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const currentOrganization = useCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()

  const { data: organizations, isLoading: orgsLoading } = useOrganizations()

  // Get workspaces from current organization
  const currentOrgWithWorkspaces = React.useMemo(() => {
    if (currentOrganization) {
      const found = organizations?.find((org: OrganizationWithWorkspaces) => org.id === currentOrganization.id)
      if (found) return found
    }
    return organizations?.find((org: OrganizationWithWorkspaces) => org.id === currentOrganization?.id) || null
  }, [organizations, currentOrganization])

  const workspaces: WorkspaceSummary[] = (currentOrgWithWorkspaces as OrganizationWithWorkspaces | null)?.workspaces ?? []

  // Check permissions
  const { canManageWorkspaces } = useOrganizationPermissions(currentOrgWithWorkspaces as OrganizationWithWorkspaces | null)

  // Workspace operations hooks
  const { mutate: createWorkspace, isPending: creating, error: createError } = useCreateWorkspaceInOrganization()
  const { mutate: updateWorkspace, isPending: updating, error: updateError } = useUpdateWorkspaceInOrganization()
  const { mutate: deleteWorkspace, isPending: deleting, error: deleteError } = useDeleteWorkspaceInOrganization()
  const { mutate: leaveWorkspace, isPending: leaving, error: leaveError } = useLeaveWorkspace()

  // Modal states
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [showLeaveModal, setShowLeaveModal] = React.useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<WorkspaceSummary | null>(null)

  const isLoading = orgsLoading || ((organizations?.length || 0) > 0 && !currentOrganization)

  const handleEnterWorkspace = (workspace: WorkspaceSummary) => {
    if (!currentOrganization?.id) return

    const userWorkspace = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      organizationId: currentOrganization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCurrentWorkspace(userWorkspace)
    router.push(`/${currentOrganization.id}/workspace/${workspace.id}`)
  }

  const handleCreateWorkspace = async (data: { name: string; description?: string }) => {
    if (!currentOrganization?.id) return

    createWorkspace({
      name: data.name,
      description: data.description,
      organizationId: currentOrganization.id,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setShowCreateModal(false)
        toast.success(`Projeto "${data.name}" foi criado com sucesso!`)
      },
      onError: (err) => {
        console.error('Error creating workspace:', err)
      }
    })
  }

  const handleEditClick = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWorkspace(workspace)
    setShowEditModal(true)
  }

  const handleUpdateWorkspace = async (data: { name: string; description?: string }) => {
    if (!selectedWorkspace) return

    updateWorkspace({ id: selectedWorkspace.id, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setShowEditModal(false)
        setSelectedWorkspace(null)
        toast.success(`Projeto "${data.name}" foi atualizado com sucesso!`)
      },
      onError: (err) => {
        console.error('Error updating workspace:', err)
      }
    })
  }

  const handleDeleteClick = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWorkspace(workspace)
    setShowDeleteModal(true)
  }

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return

    deleteWorkspace(selectedWorkspace.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setShowDeleteModal(false)
        toast.success(`Projeto "${selectedWorkspace.name}" foi excluído com sucesso!`)
        setSelectedWorkspace(null)
      },
      onError: (err) => {
        console.error('Error deleting workspace:', err)
      }
    })
  }

  const handleLeaveClick = (workspace: WorkspaceSummary, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWorkspace(workspace)
    setShowLeaveModal(true)
  }

  const handleLeaveWorkspace = async () => {
    if (!selectedWorkspace) return

    leaveWorkspace(selectedWorkspace.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setShowLeaveModal(false)
        toast.success(`Você saiu do projeto "${selectedWorkspace.name}" com sucesso!`)
        setSelectedWorkspace(null)
      },
      onError: (err) => {
        console.error('Error leaving workspace:', err)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="@container/main flex flex-col gap-6 py-6">
          <div>
            <Skeleton className="h-9 w-64" />
          </div>
          <div className="space-y-3">
            <div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="@container/main flex flex-col gap-6 py-6">
        <WorkspacesHeader
          organizationName={currentOrganization?.name || 'Organização'}
          canCreateWorkspace={canManageWorkspaces}
          onBackClick={() => router.push('/')}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <div className="space-y-6">
          {workspaces.length === 0 ? (
            <p className="text-foreground font-medium">Nenhum projeto disponível.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  canManage={canManageWorkspaces}
                  onEnter={() => handleEnterWorkspace(workspace)}
                  onEdit={(e) => handleEditClick(workspace, e)}
                  onDelete={(e) => handleDeleteClick(workspace, e)}
                  onLeave={(e) => handleLeaveClick(workspace, e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WorkspaceCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateWorkspace}
        isCreating={creating}
        error={null}
      />

      <WorkspaceEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        workspace={selectedWorkspace}
        onSubmit={handleUpdateWorkspace}
        isUpdating={updating}
        error={null}
      />

      <WorkspaceDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        workspace={selectedWorkspace}
        onConfirm={handleDeleteWorkspace}
        isDeleting={deleting}
        error={null}
      />

      <WorkspaceLeaveModal
        open={showLeaveModal}
        onOpenChange={setShowLeaveModal}
        workspace={selectedWorkspace}
        onConfirm={handleLeaveWorkspace}
        isLeaving={leaving}
        error={null}
      />
    </div>
  )
}
