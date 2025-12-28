/**
 * Can Component
 *
 * Conditional rendering based on user permissions
 * Hides content while loading (as per implementation decisions)
 */

'use client'

import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '@/hooks/api/use-permissions'

interface CanProps {
  /**
   * Single permission to check (e.g., "chat.read.all")
   */
  permission?: string

  /**
   * Multiple permissions to check with OR logic
   * User needs at least ONE of these permissions
   */
  anyPermission?: string[]

  /**
   * Multiple permissions to check with AND logic
   * User needs ALL of these permissions
   */
  allPermissions?: string[]

  /**
   * Workspace ID for permission context
   */
  workspaceId: string

  /**
   * Content to render if user has permission
   */
  children: React.ReactNode

  /**
   * Optional fallback to render if user doesn't have permission
   * If not provided, nothing is rendered
   */
  fallback?: React.ReactNode
}

/**
 * Can Component - Conditional rendering based on permissions
 *
 * @example Single permission
 * <Can permission="chat.read.all" workspaceId={workspaceId}>
 *   <ChatList />
 * </Can>
 *
 * @example Multiple permissions (OR logic)
 * <Can anyPermission={["chat.write.all", "chat.write.own"]} workspaceId={workspaceId}>
 *   <CreateChatButton />
 * </Can>
 *
 * @example Multiple permissions (AND logic)
 * <Can allPermissions={["chat.read.all", "document.write.all"]} workspaceId={workspaceId}>
 *   <AdvancedFeature />
 * </Can>
 *
 * @example With fallback
 * <Can permission="workspace.admin" workspaceId={workspaceId} fallback={<p>Access denied</p>}>
 *   <AdminPanel />
 * </Can>
 */
export function Can({
  permission,
  anyPermission,
  allPermissions,
  workspaceId,
  children,
  fallback,
}: CanProps) {
  // Validation: Exactly one permission check method must be provided
  const checkCount = [permission, anyPermission, allPermissions].filter(Boolean).length
  if (checkCount === 0) {
    console.warn('Can component: No permission check provided')
    return null
  }
  if (checkCount > 1) {
    console.warn('Can component: Multiple permission check methods provided, using only one')
  }

  // Check permissions based on provided props
  let hasPermission = false
  let isLoading = false

  if (permission) {
    const result = useHasPermission(workspaceId, permission)
    hasPermission = result.hasPermission
    isLoading = result.isLoading
  } else if (anyPermission && anyPermission.length > 0) {
    const result = useHasAnyPermission(workspaceId, anyPermission)
    hasPermission = result.hasAnyPermission
    isLoading = result.isLoading
  } else if (allPermissions && allPermissions.length > 0) {
    const result = useHasAllPermissions(workspaceId, allPermissions)
    hasPermission = result.hasAllPermissions
    isLoading = result.isLoading
  }

  // Hide content while loading (as per implementation decisions)
  if (isLoading) {
    return null
  }

  // Render children if user has permission, otherwise render fallback or null
  if (hasPermission) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}
