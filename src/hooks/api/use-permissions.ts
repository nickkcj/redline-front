/**
 * Permission Hooks
 *
 * Hooks for checking user permissions in workspaces
 * Uses React Query for caching and automatic invalidation
 */

import { useApiQuery } from './use-api'
import PermissionService from '@/lib/api/services/permission.service'
import {
  hasPermission as hasPermissionUtil,
  hasAnyPermission as hasAnyPermissionUtil,
  hasAllPermissions as hasAllPermissionsUtil,
} from '@/lib/utils/permission.utils'
import type { PermissionEntity } from '@/types/permissions'

// ============================================================================
// User Permissions
// ============================================================================

/**
 * Get current user's permissions for a workspace
 * @param workspaceId - Workspace ID
 * @returns Query result with user's permission strings array
 *
 * @example
 * const { data: permissions, isLoading } = usePermissions(workspaceId)
 * // permissions = ["chat.read.all", "document.write.own", ...]
 */
export function usePermissions(workspaceId: string) {
  return useApiQuery(
    ['permissions', 'me', workspaceId],
    () => PermissionService.getMyPermissions(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 0, // Always fresh (like Veris implementation)
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Get all available permissions in the system
 * @param workspaceId - Workspace ID
 * @returns Query result with all permission entities
 *
 * @example
 * const { data: allPermissions } = useAllPermissions(workspaceId)
 */
export function useAllPermissions(workspaceId: string) {
  return useApiQuery(
    ['permissions', 'all', workspaceId],
    () => PermissionService.getAllPermissions(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 600000, // 10 minutes (permissions list doesn't change often)
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Permission Checking Hooks
// ============================================================================

/**
 * Check if user has a specific permission
 * @param workspaceId - Workspace ID
 * @param permission - Permission to check (e.g., "chat.read.all")
 * @returns Object with hasPermission boolean and loading state
 *
 * @example
 * const { hasPermission, isLoading } = useHasPermission(workspaceId, "chat.read.all")
 * if (hasPermission) {
 *   // User can read all chats
 * }
 */
export function useHasPermission(workspaceId: string, permission: string) {
  const { data: permissions, isLoading } = usePermissions(workspaceId)

  return {
    hasPermission: permissions ? hasPermissionUtil(permissions, permission) : false,
    isLoading,
  }
}

/**
 * Check if user has ANY of the required permissions (OR logic)
 * @param workspaceId - Workspace ID
 * @param requiredPermissions - Array of permissions (user needs at least one)
 * @returns Object with hasAnyPermission boolean and loading state
 *
 * @example
 * const { hasAnyPermission } = useHasAnyPermission(workspaceId, [
 *   "chat.read.all",
 *   "chat.read.own"
 * ])
 */
export function useHasAnyPermission(workspaceId: string, requiredPermissions: string[]) {
  const { data: userPermissions, isLoading } = usePermissions(workspaceId)

  return {
    hasAnyPermission: userPermissions
      ? hasAnyPermissionUtil(userPermissions, requiredPermissions)
      : false,
    isLoading,
  }
}

/**
 * Check if user has ALL required permissions (AND logic)
 * @param workspaceId - Workspace ID
 * @param requiredPermissions - Array of permissions (user needs all)
 * @returns Object with hasAllPermissions boolean and loading state
 *
 * @example
 * const { hasAllPermissions } = useHasAllPermissions(workspaceId, [
 *   "chat.read.all",
 *   "document.write.all"
 * ])
 */
export function useHasAllPermissions(workspaceId: string, requiredPermissions: string[]) {
  const { data: userPermissions, isLoading } = usePermissions(workspaceId)

  return {
    hasAllPermissions: userPermissions
      ? hasAllPermissionsUtil(userPermissions, requiredPermissions)
      : false,
    isLoading,
  }
}
