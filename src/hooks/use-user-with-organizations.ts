import { useApiQuery } from '@/hooks/use-api'
import { apiClient } from '@/lib/api/client/base.client'
import type { ApiResponse, User } from '@/types/common'
import {
  useCurrentOrganization,
  useCurrentWorkspace,
  useSetCurrentOrganization,
  useSetCurrentWorkspace,
} from '@/store/app-store'
import { useRouter } from 'next/navigation'

export function useUserWithOrganizations() {
  const setCurrentOrganization = useSetCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const router = useRouter()

  return useApiQuery(
    ['users'], // Call to /users endpoint
    () => apiClient.get<User>('/users'), // Backend retorna UserDTO diretamente, não wrapped em ApiResponse
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onSuccess: (userData) => {
        // Process workspaces from the API response
        if (userData.workspaces && userData.workspaces.length > 0) {
          const urlParams = new URLSearchParams(window.location.search)
          const hasOrgInUrl = urlParams.has('orgId')
          const hasWorkspaceInUrl = urlParams.has('workspaceId')

          // Always select first organization (there will always be exactly 1)
          const firstWorkspace = userData.workspaces[0]
          const firstOrg = firstWorkspace.organization

          // Set first organization if not already set from URL
          if (!hasOrgInUrl || !currentOrganization || currentOrganization.id !== firstOrg.id) {
            setCurrentOrganization(firstOrg)
          }

          // Set first workspace if not already set from URL
          if (!hasWorkspaceInUrl || !currentWorkspace || currentWorkspace.id !== firstWorkspace.id) {
            setCurrentWorkspace(firstWorkspace)
          }

          // Update URL with query params automatically
          const newParams = new URLSearchParams()
          newParams.set('orgId', firstOrg.id)
          newParams.set('workspaceId', firstWorkspace.id)

          const currentPath = window.location.pathname
          const newUrl = `${currentPath}?${newParams.toString()}`

          // Only update URL if params actually changed
          if (window.location.search !== `?${newParams.toString()}`) {
            router.replace(newUrl)
          }
        }
      },
      onError: (error) => {
        console.error('Failed to fetch user with organizations:', error)
      }
    }
  )
}