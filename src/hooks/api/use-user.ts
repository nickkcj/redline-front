/**
 * User Hooks
 *
 * Hooks for user data and user-related operations
 * Uses React Query for caching and automatic invalidation
 */

import { useApiQuery } from './use-api'
import { userService } from '@/lib/api/services/user.service'
import {
  useCurrentOrganization,
  useCurrentWorkspace,
  useSetCurrentOrganization,
  useSetCurrentWorkspace,
} from '@/lib/stores/app.store'
import { useRouter } from 'next/navigation'
import type { UserWithWorkspaces } from '@/lib/api/types/user.types'
import type { OrganizationResponseDto } from '@/lib/api/types/organization.types'
import type { WorkspaceResponseDto } from '@/lib/api/types/workspace.types'

/**
 * Get current user with their organizations and workspaces
 * Automatically sets current organization and workspace in the global store
 * @returns Query result with user data including organizations/workspaces
 *
 * @example
 * const { data: userData, isLoading } = useUser()
 */
export function useUser() {
  const setCurrentOrganization = useSetCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const router = useRouter()

  return useApiQuery<UserWithWorkspaces>(
    ['users'],
    () => userService.getUserWithWorkspaces(),
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (userData) => {
        if (!userData?.workspaces || userData.workspaces.length === 0) {
          return
        }

        const urlParams = new URLSearchParams(window.location.search)
        const hasOrgInUrl = urlParams.has('orgId')
        const hasWorkspaceInUrl = urlParams.has('workspaceId')

        const firstWorkspace = userData.workspaces[0]
        const firstOrg = firstWorkspace.organization

        if (!hasOrgInUrl || !currentOrganization || currentOrganization.id !== firstOrg.id) {
          const org: OrganizationResponseDto = {
            id: firstOrg.id,
            name: firstOrg.name,
            description: firstOrg.description || undefined,
            ownerId: '', // Not available in OrganizationDTO
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          setCurrentOrganization({
            id: firstOrg.id,
            name: firstOrg.name,
            description: firstOrg.description || undefined,
            ownerId: '',
          })
        }

        if (!hasWorkspaceInUrl || !currentWorkspace || currentWorkspace.id !== firstWorkspace.id) {
          const workspace: WorkspaceResponseDto = {
            id: firstWorkspace.id,
            name: firstWorkspace.name,
            description: firstWorkspace.description || undefined,
            organizationId: firstOrg.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          setCurrentWorkspace(workspace)
        }

        const currentParams = new URLSearchParams(window.location.search)
        currentParams.set('orgId', firstOrg.id)
        currentParams.set('workspaceId', firstWorkspace.id)

        const currentPath = window.location.pathname
        const newUrl = `${currentPath}?${currentParams.toString()}`

        if (window.location.search !== `?${currentParams.toString()}`) {
          router.replace(newUrl)
        }
      },
      onError: (error) => {
        console.error('Failed to fetch user with organizations:', error)
      },
    }
  )
}

// Backward compatibility export
export const useUserWithOrganizations = useUser