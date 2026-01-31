import { useApiQuery, useApiMutation } from './use-api'
import { WorkspaceInviteService } from '@/lib/api/services/workspace-invite.service'
import type {
  CreateWorkspaceInviteDto,
  UseWorkspaceInviteDto,
} from '@/lib/api/types'

/**
 * Hook para listar convites de um workspace
 */
export function useWorkspaceInvites(workspaceId: string, options?: { enabled?: boolean }) {
  return useApiQuery(
    ['workspaces', workspaceId, 'invites'],
    () => WorkspaceInviteService.list(workspaceId),
    {
      enabled: options?.enabled !== false && !!workspaceId,
      staleTime: 30000, // 30 segundos
    }
  )
}

/**
 * Hook para criar convite de workspace por email
 */
export function useCreateWorkspaceInvite(workspaceId: string) {
  return useApiMutation(
    (data: CreateWorkspaceInviteDto) => WorkspaceInviteService.create(workspaceId, data),
    {
      successMessage: 'Convite enviado com sucesso!',
      invalidateKeys: [
        ['workspaces', workspaceId, 'invites'],
        ['workspaces', workspaceId, 'members'],
      ],
    }
  )
}

/**
 * Hook para cancelar um convite pendente
 */
export function useCancelWorkspaceInvite(workspaceId: string) {
  return useApiMutation(
    (inviteId: string) => WorkspaceInviteService.cancel(workspaceId, inviteId),
    {
      successMessage: 'Convite cancelado com sucesso!',
      invalidateKeys: [
        ['workspaces', workspaceId, 'invites'],
      ],
    }
  )
}

/**
 * Hook para aceitar um convite de workspace
 */
export function useAcceptWorkspaceInvite(workspaceId: string) {
  return useApiMutation(
    (data: UseWorkspaceInviteDto) => WorkspaceInviteService.use(workspaceId, data),
    {
      successMessage: 'Convite aceito! Bem-vindo ao workspace!',
      invalidateKeys: [
        ['workspaces'],
        ['workspaces', workspaceId],
        ['workspaces', workspaceId, 'members'],
        ['organizations'],
      ],
    }
  )
}
