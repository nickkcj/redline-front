'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  useSetCurrentOrganization,
  useSetCurrentWorkspace,
} from '@/store/app-store'

export function useUrlStoreSync() {
  const searchParams = useSearchParams()
  const setCurrentOrganization = useSetCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()
  const isInitialized = useRef(false)

  // Read URL params and update store ONLY on mount
  useEffect(() => {
    if (isInitialized.current) return

    const orgId = searchParams.get('orgId')
    const workspaceId = searchParams.get('workspaceId')

    // Set values directly in store (partial objects with just ID)
    // These will be enriched later by the API call
    if (orgId) {
      setCurrentOrganization({ id: orgId, name: '', description: '' })
    }

    if (workspaceId) {
      setCurrentWorkspace({
        id: workspaceId,
        name: '',
        description: '',
        role: 'MEMBER',
        organization: { id: orgId || '', name: '', description: '' }
      })
    }

    isInitialized.current = true
  }, [searchParams, setCurrentOrganization, setCurrentWorkspace])

  return {
    isInitialized: isInitialized.current
  }
}