import { useApiQuery, useApiMutation } from '@/hooks/api/use-api'
import { tokenStore } from '@/lib/auth/stores/auth.store'
import {
  organizationService,
  type OrganizationWithWorkspaces,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
  type CreateWorkspaceDto,
  type UpdateWorkspaceDto,
  type WorkspaceSummary,
} from '@/lib/api/services/organization.service'
import type { Organization } from '@/types/common'

// Re-export types for backward compatibility
export type {
  OrganizationWithWorkspaces,
  WorkspaceSummary,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
}

// Hook para listar organizações
export function useOrganizations() {
  const accessToken = tokenStore.getAccessToken()
  const isAuthenticated = !!accessToken

  const query = useApiQuery<OrganizationWithWorkspaces[]>(
    ['organizations'],
    async () => {
      return organizationService.getOrganizations()
    },
    {
      enabled: isAuthenticated,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  return {
    organizations: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

// Hook para criar organização
export function useCreateOrganization() {
  const mutation = useApiMutation<Organization, CreateOrganizationDto>(
    async (data) => {
      return organizationService.createOrganization(data)
    },
    {
      invalidateKeys: [['organizations']],
      showSuccessToast: false, // Vamos mostrar toast manualmente
    }
  )

  return {
    createOrganization: mutation.mutateAsync,
    creating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para atualizar organização
export function useUpdateOrganization() {
  const mutation = useApiMutation<Organization, { id: string; data: UpdateOrganizationDto }>(
    async ({ id, data }) => {
      return organizationService.updateOrganization(id, data)
    },
    {
      invalidateKeys: [['organizations']],
      showSuccessToast: false,
    }
  )

  return {
    updateOrganization: (id: string, data: UpdateOrganizationDto) => 
      mutation.mutateAsync({ id, data }),
    updating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para deletar organização
export function useDeleteOrganization() {
  const mutation = useApiMutation<void, string>(
    async (id) => {
      return organizationService.deleteOrganization(id)
    },
    {
      invalidateKeys: [['organizations']],
      showSuccessToast: false,
    }
  )

  return {
    deleteOrganization: mutation.mutateAsync,
    deleting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para verificar disponibilidade de slug (removido - não vamos usar slug)
export function useCheckSlugAvailability() {
  // Retornar sempre disponível já que não usamos mais slug
  return {
    checkSlug: async () => {},
    checking: false,
    isAvailable: true,
  }
}

// Hook para criar workspace
export function useCreateWorkspace() {
  const mutation = useApiMutation<WorkspaceSummary, CreateWorkspaceDto>(
    async (data) => {
      return organizationService.createWorkspace(data)
    },
    {
      invalidateKeys: [['organizations'], ['users']],
      showSuccessToast: false,
    }
  )

  return {
    createWorkspace: mutation.mutateAsync,
    creating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para atualizar workspace
export function useUpdateWorkspace() {
  const mutation = useApiMutation<WorkspaceSummary, { id: string; data: UpdateWorkspaceDto }>(
    async ({ id, data }) => {
      return organizationService.updateWorkspace(id, data)
    },
    {
      invalidateKeys: [['organizations'], ['users']],
      showSuccessToast: false,
    }
  )

  return {
    updateWorkspace: (id: string, data: UpdateWorkspaceDto) => 
      mutation.mutateAsync({ id, data }),
    updating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para deletar workspace
export function useDeleteWorkspace() {
  const mutation = useApiMutation<void, string>(
    async (id) => {
      return organizationService.deleteWorkspace(id)
    },
    {
      invalidateKeys: [['organizations'], ['users']],
      showSuccessToast: false,
    }
  )

  return {
    deleteWorkspace: mutation.mutateAsync,
    deleting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

// Hook para sair do workspace
export function useLeaveWorkspace() {
  const mutation = useApiMutation<void, string>(
    async (id) => {
      return organizationService.leaveWorkspace(id)
    },
    {
      invalidateKeys: [['organizations'], ['users']],
      showSuccessToast: false,
    }
  )

  return {
    leaveWorkspace: mutation.mutateAsync,
    leaving: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}

