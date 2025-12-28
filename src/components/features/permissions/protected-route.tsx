/**
 * ProtectedRoute Component
 *
 * Route-level permission guard component
 * Redirects to workspace home if user lacks required permissions
 */

'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useHasAnyPermission } from '@/hooks/api/use-permissions'

interface ProtectedRouteProps {
  /**
   * Required permissions (OR logic - user needs at least one)
   * @example ["chat.read.all", "chat.read.own"]
   */
  requiredPermissions: string[]

  /**
   * Content to render if user has permission
   */
  children: React.ReactNode

  /**
   * Optional fallback to render if user doesn't have permission
   * If not provided, redirects to workspace home
   */
  fallback?: React.ReactNode
}

/**
 * ProtectedRoute Component - Route-level permission guard
 *
 * Automatically gets workspaceId from URL params
 * Checks if user has any of the required permissions
 * Redirects to workspace home with error toast if permission denied
 *
 * @example Basic usage
 * <ProtectedRoute requiredPermissions={["chat.read.all", "chat.read.own"]}>
 *   <ChatContainer />
 * </ProtectedRoute>
 *
 * @example With custom fallback
 * <ProtectedRoute
 *   requiredPermissions={["workspace.admin"]}
 *   fallback={<PermissionDeniedMessage />}
 * >
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  requiredPermissions,
  children,
  fallback,
}: ProtectedRouteProps) {
  const params = useParams()
  const router = useRouter()

  // Extract workspace ID from URL params
  const workspaceId = params.workspaceId as string
  const orgId = params.orgId as string

  // Check if user has any of the required permissions
  const { hasAnyPermission, isLoading } = useHasAnyPermission(workspaceId, requiredPermissions)

  // Handle permission denial
  useEffect(() => {
    if (!isLoading && !hasAnyPermission && workspaceId && orgId) {
      // If no fallback provided, redirect to workspace home
      if (!fallback) {
        toast.error('Você não tem permissão para acessar esta página')
        router.push(`/${orgId}/workspace/${workspaceId}`)
      }
    }
  }, [isLoading, hasAnyPermission, workspaceId, orgId, fallback, router])

  // Hide content while loading (as per implementation decisions)
  if (isLoading) {
    return null
  }

  // Render fallback if no permission
  if (!hasAnyPermission) {
    return fallback ? <>{fallback}</> : null
  }

  // Render children if user has permission
  return <>{children}</>
}
