// ============================================================
// USE WORKSPACE - Hooks para Workspaces
// ============================================================

import { useApiQuery, useApiMutation } from './use-api'
import { WorkspaceService } from '@/lib/api/services'
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '@/lib/api/types'

/**
 * Lista todos workspaces do usuário
 */
export function useWorkspaces() {
  return useApiQuery(
    ['workspaces'],
    () => WorkspaceService.list(),
    {
      staleTime: 300000, // 5 minutos
    }
  )
}

/**
 * Lista workspaces de uma organization
 */
export function useOrganizationWorkspaces(organizationId: string) {
  return useApiQuery(
    ['workspaces', 'organization', organizationId],
    () => WorkspaceService.listByOrganization(organizationId),
    {
      enabled: !!organizationId,
      staleTime: 300000, // 5 minutos
    }
  )
}

/**
 * Busca workspace por ID
 */
export function useWorkspace(workspaceId: string) {
  return useApiQuery(
    ['workspaces', workspaceId],
    () => WorkspaceService.getById(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 300000, // 5 minutos
    }
  )
}

/**
 * Cria novo workspace
 */
export function useCreateWorkspace() {
  return useApiMutation(
    (data: CreateWorkspaceDto) => WorkspaceService.create(data),
    {
      successMessage: 'Workspace created successfully!',
      invalidateKeys: [
        ['workspaces'],
        ['workspaces', 'organization', (vars: any) => vars.organizationId],
      ],
    }
  )
}

/**
 * Atualiza workspace
 */
export function useUpdateWorkspace(workspaceId: string) {
  return useApiMutation(
    (data: UpdateWorkspaceDto) => WorkspaceService.update(workspaceId, data),
    {
      successMessage: 'Workspace updated successfully!',
      invalidateKeys: [
        ['workspaces'],
        ['workspaces', workspaceId],
      ],
    }
  )
}

/**
 * Remove workspace
 */
export function useDeleteWorkspace() {
  return useApiMutation(
    (workspaceId: string) => WorkspaceService.delete(workspaceId),
    {
      successMessage: 'Workspace deleted successfully!',
      invalidateKeys: [['workspaces']],
    }
  )
}
