// ============================================================
// USE MEMBER - Hooks para Members
// ============================================================

import { useApiQuery, useApiMutation } from './use-api'
import { MemberService } from '@/lib/api/services'
import type {
  GetMembersQueryDto,
  CreateInviteRequestDto,
  UseInviteRequestDto,
} from '@/lib/api/types'

/**
 * Lista membros do workspace
 */
export function useMembers(workspaceId: string, query?: GetMembersQueryDto) {
  return useApiQuery(
    ['workspaces', workspaceId, 'members', query],
    () => MemberService.list(workspaceId, query),
    {
      enabled: !!workspaceId,
      staleTime: 60000, // 1 minuto
    }
  )
}

/**
 * Busca membro por ID
 */
export function useMember(workspaceId: string, memberId: string) {
  return useApiQuery(
    ['workspaces', workspaceId, 'members', memberId],
    () => MemberService.getById(workspaceId, memberId),
    {
      enabled: !!workspaceId && !!memberId,
      staleTime: 60000, // 1 minuto
    }
  )
}

/**
 * Cria convite para workspace
 */
export function useCreateInvite(workspaceId: string) {
  return useApiMutation(
    (data: CreateInviteRequestDto) => MemberService.createInvite(workspaceId, data),
    {
      successMessage: 'Invite created successfully!',
      invalidateKeys: [
        ['workspaces', workspaceId, 'invites'],
      ],
    }
  )
}

/**
 * Usa convite para entrar no workspace
 */
export function useInvite(workspaceId: string) {
  return useApiMutation(
    (data: UseInviteRequestDto) => MemberService.useInvite(workspaceId, data),
    {
      successMessage: 'Successfully joined workspace!',
      invalidateKeys: [
        ['workspaces'],
        ['workspaces', workspaceId],
        ['workspaces', workspaceId, 'members'],
      ],
    }
  )
}

/**
 * Remove usuário do workspace (admin)
 */
export function useRemoveMember(workspaceId: string) {
  return useApiMutation(
    (userId: string) => MemberService.removeUser(workspaceId, userId),
    {
      successMessage: 'Member removed successfully!',
      invalidateKeys: [
        ['workspaces', workspaceId, 'members'],
      ],
    }
  )
}

/**
 * Sai do workspace (próprio usuário)
 */
export function useLeaveWorkspace() {
  return useApiMutation(
    (workspaceId: string) => MemberService.leave(workspaceId),
    {
      successMessage: 'Left workspace successfully!',
      invalidateKeys: [
        ['workspaces'],
      ],
    }
  )
}
