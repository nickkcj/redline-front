import { useApiQuery } from '@/hooks/api/use-api'
import { tokenStore } from '@/lib/auth/stores/auth.store'
import { userService } from '@/lib/api/services/user.service'
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

  // Check if user is authenticated before making the request
  const accessToken = tokenStore.getAccessToken()
  const isAuthenticated = !!accessToken

  return useApiQuery(
    ['users'], // Call to /users endpoint
    async () => {
      return userService.getUserWithWorkspaces()
    },
    {
      enabled: isAuthenticated, // Only execute query if authenticated
      staleTime: 2 * 60 * 1000, // 2 minutes
      onSuccess: (userData) => {
        // Process workspaces from the API response
        // Skip if userData is null or empty
        if (!userData || !userData.workspaces || userData.workspaces.length === 0) {
          return;
        }
        
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

          // Update URL with query params automatically (preserving existing params)
          const currentParams = new URLSearchParams(window.location.search)
          currentParams.set('orgId', firstOrg.id)
          currentParams.set('workspaceId', firstWorkspace.id)

          const currentPath = window.location.pathname
          const newUrl = `${currentPath}?${currentParams.toString()}`

          // Only update URL if params actually changed
          if (window.location.search !== `?${currentParams.toString()}`) {
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