/**
 * Role Management Hooks
 *
 * Hooks for CRUD operations on roles and role permissions
 * Uses React Query for caching and automatic invalidation
 */

import { useApiQuery, useApiMutation } from './use-api'
import PermissionService from '@/lib/api/services/permission.service'
import type { Role, CreateRoleDto, UpdateRoleDto, PermissionDto } from '@/types/permissions'

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
  return useApiQuery(
    ['roles', 'list', workspaceId],
    () => PermissionService.listRoles(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 60000, // 1 minute
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
  return useApiQuery(
    ['roles', roleId, workspaceId],
    () => PermissionService.getRole(workspaceId, roleId),
    {
      enabled: !!workspaceId && !!roleId,
      staleTime: 60000, // 1 minute
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
  return useApiMutation(
    (data: CreateRoleDto) => PermissionService.createRole(workspaceId, data),
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
  return useApiMutation(
    ({ roleId, data }: { roleId: string; data: UpdateRoleDto }) =>
      PermissionService.updateRole(workspaceId, roleId, data),
    {
      successMessage: 'Função atualizada com sucesso!',
      invalidateKeys: [
        ['roles', 'list', workspaceId],
        // Invalidate specific role query as well
      ],
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
  return useApiMutation(
    (roleId: string) => PermissionService.deleteRole(workspaceId, roleId),
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
  return useApiMutation(
    ({ roleId, permission }: { roleId: string; permission: PermissionDto }) =>
      PermissionService.addPermissionToRole(workspaceId, roleId, permission),
    {
      successMessage: 'Permissão adicionada com sucesso!',
      invalidateKeys: [
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
      ],
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
  return useApiMutation(
    ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      PermissionService.removePermissionFromRole(workspaceId, roleId, permissionId),
    {
      successMessage: 'Permissão removida com sucesso!',
      invalidateKeys: [
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
      ],
    }
  )
}
