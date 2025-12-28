"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentOrganization, useSetCurrentOrganization } from "@/lib/stores/app.store"
import { useOrganizations } from "@/hooks/api/use-organization"
import { LoadingState } from "@/components/shared/states"
import { NotFoundState } from "@/components/shared/states"
import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"

interface OrganizationProviderProps {
  children: React.ReactNode
  orgId: string
}

export function OrganizationProvider({ children, orgId }: OrganizationProviderProps) {
  const router = useRouter()
  const { data: organizations, isLoading } = useOrganizations()
  const currentOrganization = useCurrentOrganization()
  const setCurrentOrganization = useSetCurrentOrganization()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isLoading || !isMounted || !organizations) {
      return
    }

    const org = organizations.find((o: OrganizationWithWorkspaces) => o.id === orgId)

    if (!org) {
      if (!isLoading && organizations.length > 0) {
        router.replace('/org')
      }
      return
    }

    if (!currentOrganization || currentOrganization.id !== org.id) {
      setCurrentOrganization(org)
    }
  }, [orgId, organizations, isLoading, currentOrganization, setCurrentOrganization, router, isMounted])

  if (!isMounted || isLoading) {
    return <LoadingState variant="fullPage" text="Carregando organização..." />
  }

  if (!currentOrganization) {
    return (
      <NotFoundState
        entity="Organização"
        backLink="/org"
        backText="Voltar para organizações"
      />
    )
  }

  return <>{children}</>
}
