/**
 * Workspace Hooks
 *
 * Hooks for workspace management (CRUD operations)
 * Uses React Query for caching and automatic invalidation
 */

import { useQueryClient } from '@tanstack/react-query'
import { useApiQuery, useApiMutation } from './use-api'
import { workspaceService } from '@/lib/api/services/workspace.service'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponseDto,
  WorkspaceListResponse,
} from '@/lib/api/types/workspace.types'

// ============================================================================
// Workspace Queries
// ============================================================================

/**
 * List all workspaces for the current user
 * @returns Query result with workspaces list
 *
 * @example
 * const { data: workspaces, isLoading } = useWorkspaces()
 */
export function useWorkspaces() {
  return useApiQuery<WorkspaceListResponse>(
    ['workspaces'],
    () => workspaceService.list(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * List workspaces by organization
 * @param organizationId - Organization ID
 * @returns Query result with workspaces list
 *
 * @example
 * const { data: workspaces } = useOrganizationWorkspaces(orgId)
 */
export function useOrganizationWorkspaces(organizationId: string) {
  return useApiQuery<WorkspaceListResponse>(
    ['workspaces', 'organization', organizationId],
    () => workspaceService.listByOrganization(organizationId),
    {
      enabled: !!organizationId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Get a specific workspace by ID
 * @param workspaceId - Workspace ID
 * @returns Query result with workspace data
 *
 * @example
 * const { data: workspace } = useWorkspace(workspaceId)
 */
export function useWorkspace(workspaceId: string) {
  return useApiQuery<WorkspaceResponseDto>(
    ['workspaces', workspaceId],
    () => workspaceService.getById(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Workspace Mutations
// ============================================================================

/**
 * Create a new workspace
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: createWorkspace, isPending } = useCreateWorkspace()
 * createWorkspace({
 *   name: "My Workspace",
 *   organizationId: "org-123"
 * })
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useApiMutation<WorkspaceResponseDto, CreateWorkspaceDto>(
    (data) => workspaceService.create(data),
    {
      successMessage: 'Workspace criado com sucesso!',
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        if (variables.organizationId) {
          queryClient.invalidateQueries({ queryKey: ['workspaces', 'organization', variables.organizationId] })
        }
      },
    }
  )
}

/**
 * Update workspace details
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateWorkspace } = useUpdateWorkspace(workspaceId)
 * updateWorkspace({ name: "New Name" })
 */
export function useUpdateWorkspace(workspaceId: string) {
  return useApiMutation<WorkspaceResponseDto, UpdateWorkspaceDto>(
    (data) => workspaceService.update(workspaceId, data),
    {
      successMessage: 'Workspace atualizado com sucesso!',
      invalidateKeys: [
        ['workspaces'],
        ['workspaces', workspaceId],
      ],
    }
  )
}

/**
 * Delete a workspace
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteWorkspace } = useDeleteWorkspace()
 * deleteWorkspace("workspace-id-123")
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useApiMutation<void, string>(
    (workspaceId) => workspaceService.delete(workspaceId),
    {
      successMessage: 'Workspace deletado com sucesso!',
      onSuccess: (_data, deletedWorkspaceId) => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        queryClient.invalidateQueries({ queryKey: ['workspaces', deletedWorkspaceId] })
      },
    }
  )
}
