/**
 * Organization Hooks
 *
 * Hooks for organization and workspace management
 * Uses React Query for caching and automatic invalidation
 */

import { useApiQuery, useApiMutation } from './use-api'
import { organizationService } from '@/lib/api/services/organization.service'
import type {
  OrganizationResponseDto,
  OrganizationWithWorkspaces,
  WorkspaceSummary,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '@/lib/api/types/organization.types'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '@/lib/api/types/workspace.types'


// ============================================================================
// Organization Queries
// ============================================================================

/**
 * List all organizations with their workspaces
 * @returns Query result with organizations array
 *
 * @example
 * const { data: organizations, isLoading } = useOrganizations()
 */
export function useOrganizations() {
  return useApiQuery<OrganizationWithWorkspaces[]>(
    ['organizations'],
    () => organizationService.getOrganizations(),
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Organization Mutations
// ============================================================================

/**
 * Create a new organization
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: createOrganization, isPending } = useCreateOrganization()
 * createOrganization({ name: "My Org", description: "Description" })
 */
export function useCreateOrganization() {
  return useApiMutation<OrganizationResponseDto, CreateOrganizationDto>(
    (data) => organizationService.createOrganization(data),
    {
      successMessage: 'Organização criada com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

/**
 * Update an organization
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateOrganization } = useUpdateOrganization()
 * updateOrganization({ id: "123", data: { name: "New Name" } })
 */
export function useUpdateOrganization() {
  return useApiMutation<OrganizationResponseDto, { id: string; data: UpdateOrganizationDto }>(
    ({ id, data }) => organizationService.updateOrganization(id, data),
    {
      successMessage: 'Organização atualizada com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

/**
 * Delete an organization
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteOrganization } = useDeleteOrganization()
 * deleteOrganization("org-id-123")
 */
export function useDeleteOrganization() {
  return useApiMutation<void, string>(
    (id) => organizationService.deleteOrganization(id),
    {
      successMessage: 'Organização excluída com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

// ============================================================================
// Workspace Mutations (via Organization Service)
// ============================================================================

/**
 * Create a new workspace in an organization (via organization service)
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: createWorkspace, isPending } = useCreateWorkspaceInOrganization()
 * createWorkspace({ name: "My Workspace", organizationId: "org-123" })
 */
export function useCreateWorkspaceInOrganization() {
  return useApiMutation<WorkspaceSummary, CreateWorkspaceDto>(
    (data) => organizationService.createWorkspace(data),
    {
      successMessage: 'Workspace criado com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

/**
 * Update a workspace (via organization service)
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateWorkspace } = useUpdateWorkspaceInOrganization()
 * updateWorkspace({ id: "123", data: { name: "New Name" } })
 */
export function useUpdateWorkspaceInOrganization() {
  return useApiMutation<WorkspaceSummary, { id: string; data: UpdateWorkspaceDto }>(
    ({ id, data }) => organizationService.updateWorkspace(id, data),
    {
      successMessage: 'Workspace atualizado com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

/**
 * Delete a workspace (via organization service)
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteWorkspace } = useDeleteWorkspaceInOrganization()
 * deleteWorkspace("workspace-id-123")
 */
export function useDeleteWorkspaceInOrganization() {
  return useApiMutation<void, string>(
    (id) => organizationService.deleteWorkspace(id),
    {
      successMessage: 'Workspace excluído com sucesso!',
      invalidateKeys: [['organizations']],
    }
  )
}

/**
 * Leave a workspace
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: leaveWorkspace } = useLeaveWorkspace()
 * leaveWorkspace("workspace-id-123")
 */
export function useLeaveWorkspace() {
  return useApiMutation<void, string>(
    (id) => organizationService.leaveWorkspace(id),
    {
      successMessage: 'Você saiu do workspace!',
      invalidateKeys: [['organizations']],
    }
  )
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get display name for the current user
 * Tries currentUser.name, then authUser.name, then authUser.email prefix
 * Returns capitalized name or null
 */
export function useDisplayName() {
  const { useUser } = require('@/lib/stores/app.store')
  const { useAuth } = require('@/components/providers/auth-provider')

  const currentUser = useUser()
  const { user: authUser } = useAuth()

  let name = null

  if (currentUser?.name) {
    name = currentUser.name
  } else if (authUser) {
    if (authUser.name) {
      name = authUser.name
    } else if (authUser.email) {
      name = authUser.email.split('@')[0]
    }
  }

  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return null
}

/**
 * Check if the current user can manage workspaces in an organization
 * Only owners and master members can manage workspaces
 */
export function useOrganizationPermissions(organization: OrganizationWithWorkspaces | null) {
  const { useAuth } = require('@/components/providers/auth-provider')
  const { useUser } = require('@/lib/stores/app.store')
  const { useMemo } = require('react')

  const { user: authUser } = useAuth()
  const currentUser = useUser()

  return useMemo(() => {
    const userId = authUser?.id || currentUser?.id

    if (!organization || !userId) {
      return {
        canManageWorkspaces: false,
        isOwner: false,
        isMaster: false,
      }
    }

    const isOwner = organization.ownerId === userId
    const isMaster = organization.masterMemberId === userId
    const canManageWorkspaces = isOwner || isMaster

    return {
      canManageWorkspaces,
      isOwner,
      isMaster,
    }
  }, [organization, authUser, currentUser])
}

