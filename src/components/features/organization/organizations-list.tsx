"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSetCurrentOrganization, useSetCurrentWorkspace } from "@/lib/stores/app.store"
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useDisplayName
} from "@/hooks/api/use-organization"
import { useAuth } from "@/components/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"
import {
  OrganizationCard,
  OrganizationEmptyState,
  OrganizationsHeader,
  OrganizationCreateModal,
  OrganizationEditModal,
  OrganizationDeleteModal,
} from "@/components/features/organization/"

export function OrganizationsList() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const setCurrentOrganization = useSetCurrentOrganization()
  const setCurrentWorkspace = useSetCurrentWorkspace()
  const displayName = useDisplayName()

  const { data: organizations, isLoading: orgsLoading } = useOrganizations()
  const { mutateAsync: createOrganization, isPending: creating, error: createError } = useCreateOrganization()
  const { mutateAsync: updateOrganization, isPending: updating, error: updateError } = useUpdateOrganization()
  const { mutateAsync: deleteOrganization, isPending: deleting, error: deleteError } = useDeleteOrganization()

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Scaffold'

  // Scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(true)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [selectedOrganization, setSelectedOrganization] = React.useState<OrganizationWithWorkspaces | null>(null)

  // Clear current organization and workspace when landing on this page
  React.useEffect(() => {
    setCurrentOrganization(null)
    setCurrentWorkspace(null)
  }, [setCurrentOrganization, setCurrentWorkspace])

  // Handle scroll to show/hide scroll indicator
  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 10

    setShowScrollIndicator(!isAtBottom)
  }, [])

  // Add scroll listener
  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, organizations?.length])

  const handleEnterOrganization = (org: OrganizationWithWorkspaces) => {
    setCurrentWorkspace(null)
    setCurrentOrganization(org)
    router.push(`/${org.id}`)
  }

  const handleCreateOrganization = async (data: { name: string; description?: string }) => {
    try {
      const newOrg = await createOrganization(data)
      setShowCreateModal(false)
      toast.success(`Organização "${newOrg.name}" foi criada com sucesso!`)
    } catch (err) {
      console.error('Error creating organization:', err)
      toast.error('Erro ao criar organização')
    }
  }

  const handleEditClick = (org: OrganizationWithWorkspaces, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrganization(org)
    setShowEditModal(true)
  }

  const handleUpdateOrganization = async (data: { name: string; description?: string }) => {
    if (!selectedOrganization) return

    try {
      const updatedOrg = await updateOrganization({ id: selectedOrganization.id, data })
      setShowEditModal(false)
      setSelectedOrganization(null)
      toast.success(`Organização "${updatedOrg.name}" foi atualizada com sucesso!`)
    } catch (err) {
      console.error('Error updating organization:', err)
      toast.error('Erro ao atualizar organização')
    }
  }

  const handleDeleteClick = (org: OrganizationWithWorkspaces, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOrganization(org)
    setShowDeleteModal(true)
  }

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return

    try {
      await deleteOrganization(selectedOrganization.id)
      setShowDeleteModal(false)
      toast.success(`Organização "${selectedOrganization.name}" foi excluída com sucesso!`)
      setSelectedOrganization(null)
    } catch (err) {
      console.error('Error deleting organization:', err)
      toast.error('Erro ao excluir organização')
    }
  }

  if (orgsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="@container/main flex flex-col gap-6 py-6">
          <div>
            <Skeleton className="h-9 w-64 bg-muted" />
          </div>
          <div className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-40 bg-muted" />
                  <Skeleton className="h-6 w-8 rounded-full bg-muted" />
                </div>
                <Skeleton className="h-5 w-64 mt-2 bg-muted" />
              </div>
              <Skeleton className="h-10 w-48 bg-muted" />
            </div>
            <div className="flex flex-wrap gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-background/80 border border-border rounded-xl p-6 w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24 bg-muted" />
                        <Skeleton className="h-7 w-32 bg-muted" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-muted" />
                      <Skeleton className="h-4 w-3/4 bg-muted" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="@container/main flex flex-col gap-6 py-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {`Bem-vindo${displayName ? ` ao ${appName}, ${displayName}!` : ` ao ${appName}!`}`}
          </h1>
        </div>

        <div className="space-y-6">
          <OrganizationsHeader
            organizationCount={organizations?.length || 0}
            onCreateClick={() => setShowCreateModal(true)}
          />

          {(organizations?.length || 0) === 0 ? (
            <OrganizationEmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex flex-wrap gap-6 max-h-[calc(100vh-300px)] overflow-y-auto pb-8 pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30"
              >
                {organizations?.map((org: OrganizationWithWorkspaces) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    isOwner={org.ownerId === authUser?.id}
                    onEnter={() => handleEnterOrganization(org)}
                    onEdit={(e) => handleEditClick(org, e)}
                    onDelete={(e) => handleDeleteClick(org, e)}
                  />
                ))}
              </div>

              {/* Scroll indicator */}
              {(organizations?.length || 0) > 4 && (
                <div className={`absolute bottom-2 left-0 right-0 pointer-events-none flex items-end justify-center transition-opacity duration-300 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 animate-bounce bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-border font-medium">
                    <span>↓</span>
                    <span>Role para ver mais</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OrganizationCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateOrganization}
        isCreating={creating}
        error={null}
      />

      <OrganizationEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        organization={selectedOrganization}
        onSubmit={handleUpdateOrganization}
        isUpdating={updating}
        error={null}
      />

      <OrganizationDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        organization={selectedOrganization}
        onConfirm={handleDeleteOrganization}
        isDeleting={deleting}
        error={null}
      />
    </div>
  )
}
