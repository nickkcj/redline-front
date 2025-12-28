/**
 * Member Management Hooks
 *
 * Hooks for CRUD operations on workspace members and role assignments
 * Uses React Query for caching and automatic invalidation
 */

import { useApiQuery, useApiMutation } from './use-api'
import { MemberService } from '@/lib/api/services/member.service'
import type {
  MemberDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from '@/lib/api/types/permission.types'

// ============================================================================
// Member Queries
// ============================================================================

/**
 * List all members in a workspace with their roles
 * @param workspaceId - Workspace ID
 * @returns Query result with workspace members array
 *
 * @example
 * const { data: members, isLoading } = useMembers(workspaceId)
 */
export function useMembers(workspaceId: string) {
  return useApiQuery<MemberDto[]>(
    ['members', 'list', workspaceId],
    () => MemberService.listMembers(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60, // 1 minute
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

// ============================================================================
// Member Mutations
// ============================================================================

/**
 * Add a new member to the workspace by email
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: addMember, isPending } = useAddMember(workspaceId)
 * addMember({
 *   email: "user@example.com",
 *   role: "MEMBER"
 * })
 */
export function useAddMember(workspaceId: string) {
  return useApiMutation<MemberDto, AddMemberDto>(
    (data) => MemberService.addMember(workspaceId, data),
    {
      successMessage: 'Membro adicionado com sucesso!',
      invalidateKeys: [
        ['members', 'list', workspaceId],
        ['roles', 'list', workspaceId],
      ],
    }
  )
}

/**
 * Remove a member from the workspace
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: removeMember } = useRemoveMember(workspaceId)
 * removeMember("member-id-123")
 */
export function useRemoveMember(workspaceId: string) {
  return useApiMutation<void, string>(
    (memberId) => MemberService.removeMember(workspaceId, memberId),
    {
      successMessage: 'Membro removido com sucesso!',
      invalidateKeys: [
        ['members', 'list', workspaceId],
        ['roles', 'list', workspaceId],
      ],
    }
  )
}

/**
 * Update member's legacy role field (ADMIN or MEMBER)
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: updateMemberRole } = useUpdateMemberRole(workspaceId)
 * updateMemberRole({
 *   memberId: "123",
 *   data: { role: "ADMIN" }
 * })
 */
export function useUpdateMemberRole(workspaceId: string) {
  return useApiMutation<MemberDto, { memberId: string; data: UpdateMemberRoleDto }>(
    ({ memberId, data }) => MemberService.updateMemberRole(workspaceId, memberId, data),
    {
      successMessage: 'Função atualizada com sucesso!',
      invalidateKeys: [['members', 'list', workspaceId]],
    }
  )
}

// ============================================================================
// Role Assignment Mutations
// ============================================================================

/**
 * Assign a role to a workspace member
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: assignRole } = useAssignRole(workspaceId)
 * assignRole({ memberId: "123", roleId: "456" })
 */
export function useAssignRole(workspaceId: string) {
  return useApiMutation<MemberDto, { memberId: string; roleId: string }>(
    ({ memberId, roleId }) => MemberService.assignRole(workspaceId, memberId, roleId),
    {
      successMessage: 'Função atribuída com sucesso!',
      invalidateKeys: [
        ['members', 'list', workspaceId],
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
      ],
    }
  )
}

/**
 * Remove a role from a workspace member
 * @param workspaceId - Workspace ID
 * @returns Mutation function and state
 *
 * @example
 * const { mutate: removeRole } = useRemoveRole(workspaceId)
 * removeRole({ memberId: "123", roleId: "456" })
 */
export function useRemoveRole(workspaceId: string) {
  return useApiMutation<MemberDto, { memberId: string; roleId: string }>(
    ({ memberId, roleId }) => MemberService.removeRole(workspaceId, memberId, roleId),
    {
      successMessage: 'Função removida com sucesso!',
      invalidateKeys: [
        ['members', 'list', workspaceId],
        ['roles', 'list', workspaceId],
        ['permissions', 'me', workspaceId],
      ],
    }
  )
}
