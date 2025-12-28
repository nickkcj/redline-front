"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useCurrentOrganization,
  useCurrentWorkspace,
  useSetCurrentOrganization,
  useSetCurrentWorkspace,
} from "@/lib/stores/app.store"
import { useOrganizations } from "@/hooks/api/use-organization"
import { LoadingState } from "@/components/shared/states"
import { NotFoundState } from "@/components/shared/states"
import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"

interface WorkspaceProviderProps {
  children: React.ReactNode
  orgId: string
  workspaceId: string
}

export function WorkspaceProvider({ children, orgId, workspaceId }: WorkspaceProviderProps) {
  const router = useRouter()
  const { data: organizations, isLoading } = useOrganizations()
  const currentOrganization = useCurrentOrganization()
  const currentWorkspace = useCurrentWorkspace()
  const setCurrentOrganization = useSetCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()

  useEffect(() => {
    if (isLoading || !organizations) {
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

    const workspace = org.workspaces?.find(w => w.id === workspaceId)

    if (!workspace) {
      if (!isLoading) {
        router.replace(`/org/${orgId}`)
      }
      return
    }

    const workspaceData = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      organizationId: org.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (!currentWorkspace || currentWorkspace.id !== workspace.id) {
      setCurrentWorkspace(workspaceData)
    }
  }, [
    orgId,
    workspaceId,
    organizations,
    isLoading,
    currentOrganization,
    currentWorkspace,
    setCurrentOrganization,
    setCurrentWorkspace,
    router,
  ])

  if (isLoading) {
    return <LoadingState variant="fullPage" text="Carregando projeto..." />
  }

  if (!currentOrganization || !currentWorkspace) {
    return (
      <NotFoundState
        entity="Projeto"
        backLink="/org"
        backText="Voltar para organizações"
      />
    )
  }

  return <>{children}</>
}
