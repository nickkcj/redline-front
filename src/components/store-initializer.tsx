'use client'

import { useUrlStoreSync } from '@/hooks/use-url-store-sync'
import { useUserWithOrganizations } from '@/hooks/use-user-with-organizations'
import { useIsAuthenticated } from '@/store/app-store'

export function StoreInitializer() {
  const isAuthenticated = useIsAuthenticated()

  // Initialize URL sync first
  useUrlStoreSync()

  // Fetch user data with organizations (only if authenticated)
  useUserWithOrganizations()

  // This component only handles data fetching and state synchronization
  // It doesn't render anything visible
  return null
}