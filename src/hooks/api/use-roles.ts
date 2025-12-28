/**
 * Role Management Hooks
 *
 * Hooks for CRUD operations on roles and role permissions
 * Uses React Query for caching and automatic invalidation
 */

import { useQueryClient } from '@tanstack/react-query'
import { useApiQuery, useApiMutation } from './use-api'
import { permissionService } from '@/lib/api/services/permission.service'
import type {
  RoleDto,
  PermissionDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '@/lib/api/types/permission.types'

// ============================================================================
// Role Queries
// ============================================================================

/**
 * List all roles in a workspace
 * @param workspaceId - Workspace ID
 * @returns Query result with roles array
 *
 * @example
 * const { data: roles, isLoading } = useRoles(workspaceId)
 */
export function useRoles(workspaceId: string) {
  return useApiQuery<RoleDto[]>(
    ['roles', 'list', workspaceId],
    () => permissionService.listRoles(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60, // 1 minute
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Get a specific role by ID
 * @param workspaceId - Workspace ID
 * @param roleId - Role ID
 * @returns Query result with role data
 *
 * @example
 * const { data: role } = useRole(workspaceId, roleId)
 */
export function useRole(workspaceId: string, roleId: string) {
  return useApiQuery<RoleDto>(
    ['roles', roleId, workspaceId],
    () => permissionService.getRole(workspaceId, roleId),
    {
      enabled: !!workspaceId && !!roleId,
      staleTime: 1000 * 60, // 1 minute
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Role Mutations
// ============================================================================

/**
 * Create a new role
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: createRole, isPending } = useCreateRole(workspaceId)
 * createRole({
 *   name: "viewer",
 *   displayName: "Viewer",
 *   description: "Can view content",
 *   permissions: [{ resource: "chat", action: "read", scope: "all" }]
 * })
 */
export function useCreateRole(workspaceId: string) {
  return useApiMutation<RoleDto, CreateRoleDto>(
    (data) => permissionService.createRole(workspaceId, data),
    {
      successMessage: 'Função criada com sucesso!',
      invalidateKeys: [
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
      ],
    }
  )
}

/**
 * Update a role (displayName and description only)
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateRole } = useUpdateRole(workspaceId)
 * updateRole({ roleId: "123", data: { displayName: "New Name" } })
 */
export function useUpdateRole(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<RoleDto, { roleId: string; data: UpdateRoleDto }>(
    ({ roleId, data }) => permissionService.updateRole(workspaceId, roleId, data),
    {
      successMessage: 'Função atualizada com sucesso!',
      onSuccess: (_data, variables) => {
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ['roles', 'list', workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, workspaceId] })
        }
      },
    }
  )
}

/**
 * Delete a role
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: deleteRole } = useDeleteRole(workspaceId)
 * deleteRole("role-id-123")
 */
export function useDeleteRole(workspaceId: string) {
  return useApiMutation<void, string>(
    (roleId) => permissionService.deleteRole(workspaceId, roleId),
    {
      successMessage: 'Função deletada com sucesso!',
      invalidateKeys: [
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
        ['members', 'list', workspaceId],
      ],
    }
  )
}

// ============================================================================
// Role Permission Mutations
// ============================================================================

/**
 * Add a permission to a role
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: addPermission } = useAddPermissionToRole(workspaceId)
 * addPermission({
 *   roleId: "123",
 *   permission: { resource: "chat", action: "read", scope: "all" }
 * })
 */
export function useAddPermissionToRole(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<RoleDto, { roleId: string; permission: PermissionDto }>(
    ({ roleId, permission }) => permissionService.addPermissionToRole(workspaceId, roleId, permission),
    {
      successMessage: 'Permissão adicionada com sucesso!',
      onSuccess: (_data, variables) => {
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ['roles', 'list', workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['permissions', 'me', workspaceId] })
        }
      },
    }
  )
}

/**
 * Remove a permission from a role
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: removePermission } = useRemovePermissionFromRole(workspaceId)
 * removePermission({ roleId: "123", permissionId: "456" })
 */
export function useRemovePermissionFromRole(workspaceId: string) {
  const queryClient = useQueryClient()

  return useApiMutation<RoleDto, { roleId: string; permissionId: string }>(
    ({ roleId, permissionId }) => permissionService.removePermissionFromRole(workspaceId, roleId, permissionId),
    {
      successMessage: 'Permissão removida com sucesso!',
      onSuccess: (_data, variables) => {
        if (variables) {
          queryClient.invalidateQueries({ queryKey: ['roles', 'list', workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, workspaceId] })
          queryClient.invalidateQueries({ queryKey: ['permissions', 'me', workspaceId] })
        }
      },
    }
  )
}
