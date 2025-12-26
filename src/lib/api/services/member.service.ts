/**
 * Member Service
 *
 * Handles all API calls related to workspace members and role assignments
 * Follows scaffold pattern: Service → Hook → Component
 */

import { apiClient } from '@/lib/api/client/base.client'
import type {
  WorkspaceMemberWithRoles,
  AddMemberDto,
  UpdateMemberRoleDto,
} from '@/types/permissions'

class MemberService {
  /**
   * List all members in a workspace with their roles
   * @param workspaceId - Workspace ID
   * @returns Array of workspace members with user data and assigned roles
   */
  async listMembers(workspaceId: string): Promise<WorkspaceMemberWithRoles[]> {
    try {
      return await apiClient.get<WorkspaceMemberWithRoles[]>(
        `/workspaces/${workspaceId}/permissions/members`
      )
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Add a new member to the workspace by email
   * @param workspaceId - Workspace ID
   * @param data - Member data (email, optional legacy role)
   * @returns Created workspace member with user data
   */
  async addMember(workspaceId: string, data: AddMemberDto): Promise<WorkspaceMemberWithRoles> {
    try {
      return await apiClient.post<WorkspaceMemberWithRoles>(
        `/workspaces/${workspaceId}/permissions/members`,
        data
      )
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Remove a member from the workspace
   * @param workspaceId - Workspace ID
   * @param memberId - Workspace member ID
   */
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    try {
      await apiClient.delete(`/workspaces/${workspaceId}/permissions/members/${memberId}`)
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Update member's legacy role field (ADMIN or MEMBER)
   * @param workspaceId - Workspace ID
   * @param memberId - Workspace member ID
   * @param data - Update data (role)
   * @returns Updated workspace member
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<WorkspaceMemberWithRoles> {
    try {
      return await apiClient.put<WorkspaceMemberWithRoles>(
        `/workspaces/${workspaceId}/permissions/members/${memberId}/role`,
        data
      )
    } catch (error: any) {
      throw error
    }
  }

  // ============================================================================
  // Role Assignment
  // ============================================================================

  /**
   * Assign a role to a workspace member
   * @param workspaceId - Workspace ID
   * @param memberId - Workspace member ID
   * @param roleId - Role ID to assign
   * @returns Updated workspace member with new role
   */
  async assignRole(
    workspaceId: string,
    memberId: string,
    roleId: string
  ): Promise<WorkspaceMemberWithRoles> {
    try {
      return await apiClient.post<WorkspaceMemberWithRoles>(
        `/workspaces/${workspaceId}/permissions/members/${memberId}/roles/${roleId}`,
        {}
      )
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Remove a role from a workspace member
   * @param workspaceId - Workspace ID
   * @param memberId - Workspace member ID
   * @param roleId - Role ID to remove
   * @returns Updated workspace member without the role
   */
  async removeRole(
    workspaceId: string,
    memberId: string,
    roleId: string
  ): Promise<WorkspaceMemberWithRoles> {
    try {
      return await apiClient.delete<WorkspaceMemberWithRoles>(
        `/workspaces/${workspaceId}/permissions/members/${memberId}/roles/${roleId}`
      )
    } catch (error: any) {
      throw error
    }
  }
}

export default new MemberService()
